package dto

type DailyReportQuery struct {
	Date     string `form:"date"`
	BranchID *int64 `form:"branchId"`
}
