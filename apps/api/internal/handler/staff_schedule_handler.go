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
	rows, err := h.db.QueryContext(c, `SELECT s.id,s.user_id,u.name,s.branch_id,s.shift_date,s.starts_at,s.ends_at,s.status,COALESCE(s.leave_type,'') FROM staff_shifts s JOIN users u ON u.id=s.user_id WHERE s.shift_date >= $1 AND s.shift_date < $2 ORDER BY s.shift_date,s.starts_at,u.name`, month, nextMonth)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "ไม่สามารถโหลดตารางงานได้"})
		return
	}
	defer rows.Close()
	items := []gin.H{}
	for rows.Next() {
		var id, userID int64
		var branchID *int64
		var name, status, start, end, leaveType string
		var date time.Time
		if err := rows.Scan(&id, &userID, &name, &branchID, &date, &start, &end, &status, &leaveType); err != nil {
			c.JSON(500, gin.H{"success": false, "message": "ไม่สามารถอ่านตารางงานได้"})
			return
		}
		items = append(items, gin.H{"id": id, "userId": userID, "name": name, "branchId": branchID, "date": date.Format("2006-01-02"), "startsAt": start, "endsAt": end, "status": status, "leaveType": leaveType})
	}
	c.JSON(200, gin.H{"success": true, "data": items})
}

func (h *PlatformHandler) UpdateStaffShift(c *gin.Context) {
	var input struct {
		ShiftDate *string `json:"shiftDate"`
		BranchID  *int64  `json:"branchId"`
		Status    *string `json:"status"`
		LeaveType *string `json:"leaveType"`
	}
	if c.ShouldBindJSON(&input) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "ข้อมูลกะงานไม่ถูกต้อง"})
		return
	}
	if input.ShiftDate == nil && input.BranchID == nil && input.Status == nil && input.LeaveType == nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "ต้องระบุข้อมูลที่ต้องการแก้ไข"})
		return
	}
	if input.ShiftDate != nil {
		if _, err := time.Parse("2006-01-02", *input.ShiftDate); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "วันที่ต้องอยู่ในรูปแบบ YYYY-MM-DD"})
			return
		}
	}
	if input.Status != nil {
		valid := map[string]bool{"scheduled": true, "leave": true, "sick_leave": true, "personal_leave": true, "day_off": true}
		if !valid[*input.Status] {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "สถานะกะงานไม่ถูกต้อง"})
			return
		}
	}
	result, err := h.db.ExecContext(c, `UPDATE staff_shifts SET shift_date=COALESCE($1,shift_date),branch_id=COALESCE($2,branch_id),status=COALESCE($3,status),leave_type=CASE WHEN COALESCE($3,status)='scheduled' THEN NULL ELSE COALESCE($4,leave_type) END WHERE id=$5`, input.ShiftDate, input.BranchID, input.Status, input.LeaveType, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": "ไม่สามารถย้ายหรือแก้ไขกะงานได้"})
		return
	}
	updated, _ := result.RowsAffected()
	if updated == 0 {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "ไม่พบกะงาน"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"id": c.Param("id")}})
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
