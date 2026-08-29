package router

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"y/internal/config"
	"y/internal/database"
	"y/internal/middleware"
)

func TestHealthIsPublic(t *testing.T) {
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusOK)
	}
}

func TestProtectedRoutesRequireToken(t *testing.T) {
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/dashboard", nil)
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusUnauthorized)
	}
}

func TestUsersRequireAdminToken(t *testing.T) {
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/users", nil)
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusUnauthorized)
	}
}

func TestAdminRouteRejectsNonAdminRole(t *testing.T) {
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/franchisees", nil)
	req.Header.Set("Authorization", "Bearer "+testToken(t, "cashier"))
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusForbidden)
	}
}

func TestStockRequestsRejectCashierRole(t *testing.T) {
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/stock-requests", nil)
	req.Header.Set("Authorization", "Bearer "+testToken(t, "cashier"))
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusForbidden)
	}
}

func TestProtectedRoutesRejectUnexpectedSigningAlgorithm(t *testing.T) {
	r := New(nil, nil)
	claims := middleware.Claims{UserID: 7, Role: "admin", RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour))}}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS384, claims).SignedString([]byte(config.JWTSecret()))
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}
	req := httptest.NewRequest(http.MethodGet, "/api/v1/dashboard", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusUnauthorized)
	}
}

func TestCORSOnlyAllowsConfiguredOrigin(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	t.Setenv("CORS_ORIGINS", "https://admin.example.com")
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodOptions, "/health", nil)
	req.Header.Set("Origin", "https://admin.example.com")
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if got := res.Header().Get("Access-Control-Allow-Origin"); got != "https://admin.example.com" {
		t.Fatalf("allowed origin = %q", got)
	}
	if res.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusNoContent)
	}
	if got := res.Header().Get("Vary"); got != "Origin" {
		t.Fatalf("Vary = %q, want Origin", got)
	}
	if got := res.Header().Get("Access-Control-Max-Age"); got != "600" {
		t.Fatalf("Access-Control-Max-Age = %q, want 600", got)
	}
}

func TestCORSRejectsUnknownProductionOrigin(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	t.Setenv("CORS_ORIGINS", "https://admin.example.com")
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodOptions, "/health", nil)
	req.Header.Set("Origin", "https://attacker.example.com")
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusForbidden)
	}
	if got := res.Header().Get("Access-Control-Allow-Origin"); got != "" {
		t.Fatalf("unexpected allowed origin: %q", got)
	}
}

func TestSecurityHeaders(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if got := res.Header().Get("X-Content-Type-Options"); got != "nosniff" {
		t.Fatalf("X-Content-Type-Options = %q", got)
	}
	if got := res.Header().Get("X-Frame-Options"); got != "DENY" {
		t.Fatalf("X-Frame-Options = %q", got)
	}
	if got := res.Header().Get("Content-Security-Policy"); got == "" {
		t.Fatal("expected Content-Security-Policy header")
	}
	if got := res.Header().Get("Strict-Transport-Security"); got == "" {
		t.Fatal("expected Strict-Transport-Security header in production")
	}
}

func TestMetricsAreAdminOnly(t *testing.T) {
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics", nil)
	req.Header.Set("Authorization", "Bearer "+testToken(t, "admin"))
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusOK)
	}
	if !strings.Contains(res.Body.String(), "superblack_http_requests_total") {
		t.Fatalf("metrics response did not contain request counter: %s", res.Body.String())
	}
}

func TestInventoryRouteReadsFromIsolatedPostgres(t *testing.T) {
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("กำหนด TEST_DATABASE_URL เพื่อทดสอบ PostgreSQL integration")
	}
	db := openRouterTestDB(t, url)
	var branchID int64
	if err := db.QueryRow(`INSERT INTO branches(name,code) VALUES('สาขาทดสอบ','ROUTER-001') RETURNING id`).Scan(&branchID); err != nil {
		t.Fatalf("สร้างสาขาทดสอบ: %v", err)
	}
	if _, err := db.Exec(`INSERT INTO inventory_items(branch_id,name,category,kind,quantity,unit,reorder_level,unit_cost) VALUES($1,'นมทดสอบ','dairy','ingredient',3,'ลิตร',1,45)`, branchID); err != nil {
		t.Fatalf("สร้างวัตถุดิบทดสอบ: %v", err)
	}
	r := New(db, nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/inventory?branchId=1", nil)
	req.Header.Set("Authorization", "Bearer "+testToken(t, "admin"))
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", res.Code, res.Body.String())
	}
	if !strings.Contains(res.Body.String(), "นมทดสอบ") {
		t.Fatalf("inventory response missing item: %s", res.Body.String())
	}
}

func TestPOSOrderDeductsInventoryOnlyWhenStockIsSufficient(t *testing.T) {
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("กำหนด TEST_DATABASE_URL เพื่อทดสอบ PostgreSQL integration")
	}
	db := openRouterTestDB(t, url)
	var branchID, inventoryID, menuID int64
	if err := db.QueryRow(`INSERT INTO branches(name,code) VALUES('สาขาทดสอบ','POS-001') RETURNING id`).Scan(&branchID); err != nil {
		t.Fatalf("สร้างสาขาทดสอบ: %v", err)
	}
	if _, err := db.Exec(`INSERT INTO users(id,name,username,email,password_hash,role,branch_id) VALUES(7,'แคชเชียร์','cashier','cashier@example.com','hash','cashier',$1)`, branchID); err != nil {
		t.Fatalf("สร้างผู้ใช้ทดสอบ: %v", err)
	}
	if err := db.QueryRow(`INSERT INTO inventory_items(branch_id,name,category,kind,quantity,unit,reorder_level,unit_cost) VALUES($1,'เมล็ดกาแฟ','coffee','ingredient',20,'กรัม',2,1.5) RETURNING id`, branchID).Scan(&inventoryID); err != nil {
		t.Fatalf("สร้างวัตถุดิบ: %v", err)
	}
	if err := db.QueryRow(`INSERT INTO menu_items(branch_id,name,category,store_price,lineman_price,cost_price,status) VALUES($1,'อเมริกาโน่','coffee',60,70,18,'available') RETURNING id`, branchID).Scan(&menuID); err != nil {
		t.Fatalf("สร้างเมนู: %v", err)
	}
	if _, err := db.Exec(`INSERT INTO menu_item_ingredients(menu_item_id,inventory_item_id,quantity,unit,cost_amount) VALUES($1,$2,12,'กรัม',18)`, menuID, inventoryID); err != nil {
		t.Fatalf("สร้างสูตรเมนู: %v", err)
	}
	r := New(db, nil)
	requestOrder := func(quantity int) *httptest.ResponseRecorder {
		body := strings.NewReader(`{"channel":"storefront","items":[{"productName":"อเมริกาโน่","quantity":` + strconv.Itoa(quantity) + `,"unitPrice":0}]}`)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/pos/orders", body)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+testTokenWithBranch(t, "cashier", branchID))
		res := httptest.NewRecorder()
		r.ServeHTTP(res, req)
		return res
	}
	if res := requestOrder(1); res.Code != http.StatusCreated {
		t.Fatalf("successful order status = %d, body = %s", res.Code, res.Body.String())
	}
	var quantity float64
	if err := db.QueryRow(`SELECT quantity FROM inventory_items WHERE id=$1`, inventoryID).Scan(&quantity); err != nil || quantity != 8 {
		t.Fatalf("remaining inventory = %v, err = %v", quantity, err)
	}
	if res := requestOrder(1); res.Code != http.StatusConflict {
		t.Fatalf("insufficient stock status = %d, body = %s", res.Code, res.Body.String())
	}
	var orders int
	if err := db.QueryRow(`SELECT COUNT(*) FROM pos_orders`).Scan(&orders); err != nil || orders != 1 {
		t.Fatalf("orders = %d, err = %v", orders, err)
	}
}

func TestPOSOrderRollsBackAllItemsWhenOneItemIsOutOfStock(t *testing.T) {
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("กำหนด TEST_DATABASE_URL เพื่อทดสอบ PostgreSQL integration")
	}
	db := openRouterTestDB(t, url)
	branchID := seedBranch(t, db, "POS-ROLLBACK")
	seedUser(t, db, 7, "cashier-rollback", "cashier", branchID, nil)
	coffeeID := seedInventory(t, db, branchID, "กาแฟ", 20)
	milkID := seedInventory(t, db, branchID, "นม", 5)
	seedMenu(t, db, branchID, "อเมริกาโน่ทดสอบ", coffeeID, 10)
	seedMenu(t, db, branchID, "ลาเต้ทดสอบ", milkID, 10)
	r := New(db, nil)
	res := requestJSON(r, http.MethodPost, "/api/v1/pos/orders", `{"channel":"storefront","items":[{"productName":"อเมริกาโน่ทดสอบ","quantity":1,"unitPrice":0},{"productName":"ลาเต้ทดสอบ","quantity":1,"unitPrice":0}]}`, testTokenWithBranch(t, "cashier", branchID))
	if res.Code != http.StatusConflict {
		t.Fatalf("status = %d, body = %s", res.Code, res.Body.String())
	}
	assertInventoryQuantity(t, db, coffeeID, 20)
	assertInventoryQuantity(t, db, milkID, 5)
	var orders int
	if err := db.QueryRow(`SELECT COUNT(*) FROM pos_orders`).Scan(&orders); err != nil || orders != 0 {
		t.Fatalf("orders = %d, err = %v", orders, err)
	}
}

func TestStockRequestLifecycleAddsInventoryAndWritesAudit(t *testing.T) {
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("กำหนด TEST_DATABASE_URL เพื่อทดสอบ PostgreSQL integration")
	}
	db := openRouterTestDB(t, url)
	branchID := seedBranch(t, db, "STOCK-LIFECYCLE")
	seedUser(t, db, 7, "admin-stock", "admin", branchID, nil)
	inventoryID := seedInventory(t, db, branchID, "เมล็ดกาแฟ", 2)
	r := New(db, nil)
	create := requestJSON(r, http.MethodPost, "/api/v1/stock-requests", `{"branchId":1,"note":"เติมสต็อก","items":[{"inventoryItemId":1,"name":"เมล็ดกาแฟ","quantity":5,"unit":"กรัม"}]}`, testToken(t, "admin"))
	if create.Code != http.StatusCreated {
		t.Fatalf("create status = %d, body = %s", create.Code, create.Body.String())
	}
	requestID := responseID(t, create)
	for _, status := range []string{"approved", "preparing", "completed"} {
		res := requestJSON(r, http.MethodPatch, "/api/v1/stock-requests/"+strconv.FormatInt(requestID, 10)+"/status", `{"status":"`+status+`"}`, testToken(t, "admin"))
		if res.Code != http.StatusOK {
			t.Fatalf("%s status = %d, body = %s", status, res.Code, res.Body.String())
		}
	}
	assertInventoryQuantity(t, db, inventoryID, 7)
	var actions int
	if err := db.QueryRow(`SELECT COUNT(*) FROM audit_events WHERE entity_type='stock_request' AND entity_id=$1`, requestID).Scan(&actions); err != nil || actions != 4 {
		t.Fatalf("audit actions = %d, err = %v", actions, err)
	}
}

func TestInventoryAndMenuCRUDWriteAuditEvents(t *testing.T) {
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("กำหนด TEST_DATABASE_URL เพื่อทดสอบ PostgreSQL integration")
	}
	db := openRouterTestDB(t, url)
	branchID := seedBranch(t, db, "CRUD-AUDIT")
	seedUser(t, db, 7, "admin-crud", "admin", branchID, nil)
	r := New(db, nil)
	token := testToken(t, "admin")
	createInventory := requestJSON(r, http.MethodPost, "/api/v1/inventory?branchId=1", `{"name":"นม CRUD","category":"dairy","kind":"ingredient","quantity":3,"unit":"ลิตร","reorderLevel":1,"unitCost":45}`, token)
	if createInventory.Code != http.StatusCreated {
		t.Fatalf("create inventory = %d: %s", createInventory.Code, createInventory.Body.String())
	}
	inventoryID := responseID(t, createInventory)
	for _, method := range []string{http.MethodPatch, http.MethodDelete} {
		body := ""
		if method == http.MethodPatch {
			body = `{"name":"นม CRUD ใหม่","category":"dairy","kind":"ingredient","quantity":4,"unit":"ลิตร","reorderLevel":1,"unitCost":50}`
		}
		res := requestJSON(r, method, "/api/v1/inventory/"+strconv.FormatInt(inventoryID, 10)+"?branchId=1", body, token)
		if res.Code != map[string]int{http.MethodPatch: http.StatusOK, http.MethodDelete: http.StatusNoContent}[method] {
			t.Fatalf("%s inventory = %d: %s", method, res.Code, res.Body.String())
		}
	}
	recipeInventoryID := seedInventory(t, db, branchID, "กาแฟสูตร", 100)
	menuPayload := `{"name":"เมนู CRUD","category":"coffee","storePrice":60,"linemanPrice":70,"costPrice":15,"ingredients":[{"inventoryItemId":` + strconv.FormatInt(recipeInventoryID, 10) + `,"quantity":10,"unit":"กรัม"}]}`
	createMenu := requestJSON(r, http.MethodPost, "/api/v1/menu-items?branchId=1", menuPayload, token)
	if createMenu.Code != http.StatusCreated {
		t.Fatalf("create menu = %d: %s", createMenu.Code, createMenu.Body.String())
	}
	menuID := responseID(t, createMenu)
	updatedMenu := strings.Replace(menuPayload, "เมนู CRUD", "เมนู CRUD ใหม่", 1)
	if res := requestJSON(r, http.MethodPatch, "/api/v1/menu-items/"+strconv.FormatInt(menuID, 10)+"?branchId=1", updatedMenu, token); res.Code != http.StatusOK {
		t.Fatalf("update menu = %d: %s", res.Code, res.Body.String())
	}
	if res := requestJSON(r, http.MethodDelete, "/api/v1/menu-items/"+strconv.FormatInt(menuID, 10)+"?branchId=1", "", token); res.Code != http.StatusNoContent {
		t.Fatalf("delete menu = %d: %s", res.Code, res.Body.String())
	}
	var events int
	if err := db.QueryRow(`SELECT COUNT(*) FROM audit_events WHERE action IN ('created','updated','deleted')`).Scan(&events); err != nil || events != 5 {
		t.Fatalf("audit events = %d, err = %v", events, err)
	}
}

func TestLoginRateLimitResetsAfterSuccessfulLogin(t *testing.T) {
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("กำหนด TEST_DATABASE_URL เพื่อทดสอบ PostgreSQL integration")
	}
	db := openRouterTestDB(t, url)
	branchID := seedBranch(t, db, "LOGIN-LIMIT")
	passwordHash, err := bcrypt.GenerateFromPassword([]byte("correct-password"), bcrypt.MinCost)
	if err != nil {
		t.Fatal(err)
	}
	seedUser(t, db, 7, "rate-limit-user", "admin", branchID, passwordHash)
	r := New(db, nil)
	login := func(password string) *httptest.ResponseRecorder {
		return requestJSON(r, http.MethodPost, "/api/v1/auth/login", `{"username":"rate-limit-user","password":"`+password+`"}`, "")
	}
	for i := 0; i < 9; i++ {
		if res := login("wrong"); res.Code != http.StatusUnauthorized {
			t.Fatalf("attempt %d = %d", i+1, res.Code)
		}
	}
	if res := login("correct-password"); res.Code != http.StatusOK {
		t.Fatalf("success status = %d: %s", res.Code, res.Body.String())
	}
	for i := 0; i < 10; i++ {
		if res := login("wrong"); res.Code != http.StatusUnauthorized {
			t.Fatalf("after reset attempt %d = %d", i+1, res.Code)
		}
	}
	if res := login("wrong"); res.Code != http.StatusTooManyRequests {
		t.Fatalf("limit status = %d", res.Code)
	}
}

func TestWebsiteLeadLifecycleAndBranchScope(t *testing.T) {
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("กำหนด TEST_DATABASE_URL เพื่อทดสอบ PostgreSQL integration")
	}
	db := openRouterTestDB(t, url)
	branchOne := seedBranch(t, db, "SCOPE-ONE")
	branchTwo := seedBranch(t, db, "SCOPE-TWO")
	seedUser(t, db, 7, "admin-lead", "admin", branchOne, nil)
	r := New(db, nil)
	lead := requestJSON(r, http.MethodPost, "/api/v1/website/leads", `{"name":"ผู้สนใจแฟรนไชส์","phone":"0812345678","topic":"franchise"}`, "")
	if lead.Code != http.StatusCreated {
		t.Fatalf("lead create = %d: %s", lead.Code, lead.Body.String())
	}
	leadID := responseID(t, lead)
	for _, status := range []string{"contacted", "closed"} {
		res := requestJSON(r, http.MethodPatch, "/api/v1/website/leads/"+strconv.FormatInt(leadID, 10)+"/status", `{"status":"`+status+`"}`, testToken(t, "admin"))
		if res.Code != http.StatusOK {
			t.Fatalf("lead %s = %d", status, res.Code)
		}
	}
	managerToken := testTokenWithBranch(t, "branch_manager", branchOne)
	res := requestJSON(r, http.MethodGet, "/api/v1/branches", "", managerToken)
	if res.Code != http.StatusOK || !strings.Contains(res.Body.String(), "SCOPE-ONE") || strings.Contains(res.Body.String(), "SCOPE-TWO") {
		t.Fatalf("branch scope response: %d %s", res.Code, res.Body.String())
	}
	otherInventoryID := seedInventory(t, db, branchTwo, "ของสาขาอื่น", 1)
	if res := requestJSON(r, http.MethodPatch, "/api/v1/inventory/"+strconv.FormatInt(otherInventoryID, 10), `{"name":"ต้องห้าม","unit":"ชิ้น"}`, managerToken); res.Code != http.StatusNotFound {
		t.Fatalf("branch mutation = %d: %s", res.Code, res.Body.String())
	}
}

func TestAuditStockRequestPaginationAndReportValidation(t *testing.T) {
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("กำหนด TEST_DATABASE_URL เพื่อทดสอบ PostgreSQL integration")
	}
	db := openRouterTestDB(t, url)
	branchID := seedBranch(t, db, "PAGINATION")
	seedUser(t, db, 7, "admin-pagination", "admin", branchID, nil)
	if _, err := db.Exec(`INSERT INTO audit_events(branch_id,actor_id,entity_type,entity_id,action) VALUES($1,7,'test',1,'created')`, branchID); err != nil {
		t.Fatal(err)
	}
	r := New(db, nil)
	token := testToken(t, "admin")
	if res := requestJSON(r, http.MethodGet, "/api/v1/audit-events?limit=999&offset=-1", "", token); res.Code != http.StatusOK || !strings.Contains(res.Body.String(), `"limit":100`) || !strings.Contains(res.Body.String(), `"offset":0`) {
		t.Fatalf("audit pagination: %d %s", res.Code, res.Body.String())
	}
	if res := requestJSON(r, http.MethodGet, "/api/v1/stock-requests?limit=999&offset=-1", "", token); res.Code != http.StatusOK || !strings.Contains(res.Body.String(), `"limit":100`) {
		t.Fatalf("stock pagination: %d %s", res.Code, res.Body.String())
	}
	if res := requestJSON(r, http.MethodGet, "/api/v1/reports/daily-sales?date=not-a-date", "", token); res.Code != http.StatusBadRequest {
		t.Fatalf("report validation = %d: %s", res.Code, res.Body.String())
	}
}

func openRouterTestDB(t *testing.T, url string) *sql.DB {
	t.Helper()
	db, err := database.Open(context.Background(), url)
	if err != nil {
		t.Fatalf("เปิดฐานข้อมูลทดสอบ: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	if _, err := db.Exec(`TRUNCATE TABLE website_leads, audit_events, pos_order_items, pos_orders, stock_request_items, stock_requests, users, menu_item_ingredients, menu_items, inventory_items, branches, franchisees RESTART IDENTITY CASCADE`); err != nil {
		t.Fatalf("ล้างฐานข้อมูลทดสอบ: %v", err)
	}
	return db
}

func requestJSON(r http.Handler, method, path, body, token string) *httptest.ResponseRecorder {
	var reader *strings.Reader
	reader = strings.NewReader(body)
	req := httptest.NewRequest(method, path, reader)
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	return res
}

func responseID(t *testing.T, res *httptest.ResponseRecorder) int64 {
	t.Helper()
	var payload struct {
		Data struct {
			ID int64 `json:"id"`
		} `json:"data"`
	}
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil || payload.Data.ID < 1 {
		t.Fatalf("อ่าน id จาก response ไม่สำเร็จ: err=%v body=%s", err, res.Body.String())
	}
	return payload.Data.ID
}

func seedBranch(t *testing.T, db *sql.DB, code string) int64 {
	t.Helper()
	var id int64
	if err := db.QueryRow(`INSERT INTO branches(name,code) VALUES($1,$2) RETURNING id`, "สาขา "+code, code).Scan(&id); err != nil {
		t.Fatalf("สร้างสาขา: %v", err)
	}
	return id
}

func seedUser(t *testing.T, db *sql.DB, id int64, username, role string, branchID int64, passwordHash []byte) {
	t.Helper()
	if passwordHash == nil {
		passwordHash = []byte("hash")
	}
	if _, err := db.Exec(`INSERT INTO users(id,name,username,email,password_hash,role,branch_id) VALUES($1,$2,$3,$4,$5,$6,$7)`, id, username, username, username+"@example.com", string(passwordHash), role, branchID); err != nil {
		t.Fatalf("สร้างผู้ใช้: %v", err)
	}
}

func seedInventory(t *testing.T, db *sql.DB, branchID int64, name string, quantity float64) int64 {
	t.Helper()
	var id int64
	if err := db.QueryRow(`INSERT INTO inventory_items(branch_id,name,category,kind,quantity,unit,reorder_level,unit_cost) VALUES($1,$2,'test','ingredient',$3,'กรัม',1,1) RETURNING id`, branchID, name, quantity).Scan(&id); err != nil {
		t.Fatalf("สร้างวัตถุดิบ: %v", err)
	}
	return id
}

func seedMenu(t *testing.T, db *sql.DB, branchID int64, name string, inventoryID int64, quantity float64) {
	t.Helper()
	var menuID int64
	if err := db.QueryRow(`INSERT INTO menu_items(branch_id,name,category,store_price,lineman_price,cost_price,status) VALUES($1,$2,'coffee',60,70,18,'available') RETURNING id`, branchID, name).Scan(&menuID); err != nil {
		t.Fatalf("สร้างเมนู: %v", err)
	}
	if _, err := db.Exec(`INSERT INTO menu_item_ingredients(menu_item_id,inventory_item_id,quantity,unit,cost_amount) VALUES($1,$2,$3,'กรัม',1)`, menuID, inventoryID, quantity); err != nil {
		t.Fatalf("สร้างสูตร: %v", err)
	}
}

func assertInventoryQuantity(t *testing.T, db *sql.DB, inventoryID int64, want float64) {
	t.Helper()
	var got float64
	if err := db.QueryRow(`SELECT quantity FROM inventory_items WHERE id=$1`, inventoryID).Scan(&got); err != nil || got != want {
		t.Fatalf("inventory quantity = %v, want %v, err=%v", got, want, err)
	}
}

func testToken(t *testing.T, role string) string {
	return testTokenWithBranch(t, role, 0)
}

func testTokenWithBranch(t *testing.T, role string, branchID int64) string {
	t.Helper()
	claims := middleware.Claims{UserID: 7, Role: role, RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour))}}
	if branchID > 0 {
		claims.BranchID = &branchID
	}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(config.JWTSecret()))
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}
	return token
}
