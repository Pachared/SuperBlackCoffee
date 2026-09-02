package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func (h *PlatformHandler) ListStaffSchedules(c *gin.Context) {
	month, err := time.Parse("2006-01", c.DefaultQuery("month", time.Now().Format("2006-01")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "month ต้องอยู่ในรูปแบบ YYYY-MM"})
		return
	}
	nextMonth := month.AddDate(0, 1, 0)
	rows, err := h.db.QueryContext(c, `SELECT s.id,s.user_id,u.name,s.branch_id,s.shift_date,s.starts_at,s.ends_at,s.status FROM staff_shifts s JOIN users u ON u.id=s.user_id WHERE s.shift_date >= $1 AND s.shift_date < $2 ORDER BY s.shift_date,s.starts_at,u.name`, month, nextMonth)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "ไม่สามารถโหลดตารางงานได้"})
		return
	}
	defer rows.Close()
	items := []gin.H{}
	for rows.Next() {
		var id, userID int64
		var branchID *int64
		var name, status string
		var date time.Time
		var start, end time.Time
		if err := rows.Scan(&id, &userID, &name, &branchID, &date, &start, &end, &status); err != nil {
			c.JSON(500, gin.H{"success": false, "message": "ไม่สามารถอ่านตารางงานได้"})
			return
		}
		items = append(items, gin.H{"id": id, "userId": userID, "name": name, "branchId": branchID, "date": date.Format("2006-01-02"), "startsAt": start.Format("15:04"), "endsAt": end.Format("15:04"), "status": status})
	}
	c.JSON(200, gin.H{"success": true, "data": items})
}

func (h *PlatformHandler) GenerateStaffSchedules(c *gin.Context) {
	var input struct {
		Month string `json:"month" binding:"required"`
	}
	if c.ShouldBindJSON(&input) != nil {
		c.JSON(400, gin.H{"success": false, "message": "ต้องระบุ month"})
		return
	}
	month, err := time.Parse("2006-01", input.Month)
	if err != nil {
		c.JSON(400, gin.H{"success": false, "message": "month ต้องอยู่ในรูปแบบ YYYY-MM"})
		return
	}
	monthEnd := month.AddDate(0, 1, 0)
	result, err := h.db.ExecContext(c, `INSERT INTO staff_shifts(user_id,branch_id,shift_date,starts_at,ends_at,status)
SELECT u.id,u.branch_id,d::date,'08:00','17:00','scheduled'
FROM users u CROSS JOIN generate_series($1::date,$2::date - INTERVAL '1 day',INTERVAL '1 day') d
WHERE u.role IN ('cashier','branch_manager') AND EXTRACT(ISODOW FROM d) BETWEEN 1 AND 5
ON CONFLICT (user_id,shift_date) DO NOTHING`, month, monthEnd)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "ไม่สามารถจัดตารางอัตโนมัติได้"})
		return
	}
	created, _ := result.RowsAffected()
	c.JSON(201, gin.H{"success": true, "data": gin.H{"created": created, "month": input.Month}})
}
