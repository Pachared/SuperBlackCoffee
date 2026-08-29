package validation

import "testing"

func TestRequired(t *testing.T) {
	if !Required("กาแฟ", " เมล็ดกาแฟ ") {
		t.Fatal("expected non-empty values to pass")
	}
	if Required("กาแฟ", "  ") {
		t.Fatal("expected whitespace-only value to fail")
	}
}

func TestNumberValidation(t *testing.T) {
	if !Positive(0.01) || Positive(0) || Positive(-1) {
		t.Fatal("Positive returned an unexpected result")
	}
	if !NonNegative(0) || !NonNegative(1) || NonNegative(-0.01) {
		t.Fatal("NonNegative returned an unexpected result")
	}
}

func TestEnumValidation(t *testing.T) {
	if !Channel("storefront") || !Channel("lineman") || Channel("delivery") {
		t.Fatal("Channel returned an unexpected result")
	}
	if !InventoryKind("ingredient") || !InventoryKind("stock") || InventoryKind("menu") {
		t.Fatal("InventoryKind returned an unexpected result")
	}
	for _, status := range []string{"pending", "approved", "preparing", "completed", "rejected"} {
		if !StockStatus(status) {
			t.Fatalf("expected status %q to pass", status)
		}
	}
	if StockStatus("cancelled") {
		t.Fatal("unexpected stock status accepted")
	}
}
