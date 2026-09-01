package handler

import (
	"context"
	"database/sql"
)

func recordStockMovementTx(ctx context.Context, tx *sql.Tx, branchID, inventoryItemID int64, movementType string, quantityDelta, quantityBefore, quantityAfter float64, referenceType string, referenceID *int64, note string, actorID int64) error {
	_, err := tx.ExecContext(ctx, `INSERT INTO stock_movements(branch_id,inventory_item_id,movement_type,quantity_delta,quantity_before,quantity_after,reference_type,reference_id,note,actor_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, branchID, inventoryItemID, movementType, quantityDelta, quantityBefore, quantityAfter, referenceType, referenceID, note, actorID)
	return err
}
