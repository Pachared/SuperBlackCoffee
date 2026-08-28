package validation

import "strings"

func Required(values ...string) bool {
	for _, value := range values {
		if strings.TrimSpace(value) == "" {
			return false
		}
	}
	return true
}
func Positive(value float64) bool     { return value > 0 }
func NonNegative(value float64) bool  { return value >= 0 }
func Channel(value string) bool       { return value == "storefront" || value == "lineman" }
func InventoryKind(value string) bool { return value == "ingredient" || value == "stock" }
func StockStatus(value string) bool {
	switch value {
	case "pending", "approved", "preparing", "completed", "rejected":
		return true
	}
	return false
}
