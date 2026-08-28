package model

type DailySalesItem struct {
	ProductName  string  `json:"productName"`
	Quantity     int     `json:"quantity"`
	CostTotal    float64 `json:"costTotal"`
	RevenueTotal float64 `json:"revenueTotal"`
	Profit       float64 `json:"profit"`
}

type SalesTotals struct {
	Quantity     int     `json:"quantity"`
	CostTotal    float64 `json:"costTotal"`
	RevenueTotal float64 `json:"revenueTotal"`
	Profit       float64 `json:"profit"`
}

type DailySalesReport struct {
	Date   string           `json:"date"`
	Items  []DailySalesItem `json:"items"`
	Totals SalesTotals      `json:"totals"`
}

type DashboardSummary struct {
	TodaySales  float64 `json:"todaySales"`
	TodayOrders int     `json:"todayOrders"`
}
