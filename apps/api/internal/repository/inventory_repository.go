package repository

import (
	"context"
	"database/sql"

	"y/internal/model"
)

type InventoryRepository interface {
	List(ctx context.Context, branchID int64, kind string) ([]model.InventoryItem, error)
	Create(ctx context.Context, branchID int64, item model.InventoryItem) (int64, error)
	Update(ctx context.Context, branchID, id int64, item model.InventoryItem) (bool, error)
	Delete(ctx context.Context, branchID, id int64) (bool, error)
}

type postgresInventoryRepository struct{ db *sql.DB }

func NewPostgresInventoryRepository(db *sql.DB) InventoryRepository {
	return &postgresInventoryRepository{db: db}
}

func (r *postgresInventoryRepository) List(ctx context.Context, branchID int64, kind string) ([]model.InventoryItem, error) {
	query := `SELECT id,name,category,kind,quantity,unit,reorder_level,unit_cost,image_url,created_at,updated_at FROM inventory_items WHERE branch_id=$1`
	args := []any{branchID}
	if kind != "" {
		query += ` AND kind=$2`
		args = append(args, kind)
	}
	query += ` ORDER BY name`
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]model.InventoryItem, 0)
	for rows.Next() {
		var item model.InventoryItem
		if err := rows.Scan(&item.ID, &item.Name, &item.Category, &item.Kind, &item.Quantity, &item.Unit, &item.ReorderLevel, &item.UnitCost, &item.ImageURL, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		if item.Quantity <= 0 {
			item.Status = "out"
		} else if item.Quantity <= item.ReorderLevel {
			item.Status = "low"
		} else {
			item.Status = "ready"
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *postgresInventoryRepository) Create(ctx context.Context, branchID int64, item model.InventoryItem) (int64, error) {
	var id int64
	err := r.db.QueryRowContext(ctx, `INSERT INTO inventory_items(branch_id,name,category,kind,quantity,unit,reorder_level,unit_cost) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`, branchID, item.Name, item.Category, item.Kind, item.Quantity, item.Unit, item.ReorderLevel, item.UnitCost).Scan(&id)
	return id, err
}

func (r *postgresInventoryRepository) Update(ctx context.Context, branchID, id int64, item model.InventoryItem) (bool, error) {
	result, err := r.db.ExecContext(ctx, `UPDATE inventory_items SET name=$1,category=$2,kind=$3,quantity=$4,unit=$5,reorder_level=$6,unit_cost=$7,updated_at=now() WHERE id=$8 AND branch_id=$9`, item.Name, item.Category, item.Kind, item.Quantity, item.Unit, item.ReorderLevel, item.UnitCost, id, branchID)
	if err != nil {
		return false, err
	}
	n, err := result.RowsAffected()
	return n > 0, err
}

func (r *postgresInventoryRepository) Delete(ctx context.Context, branchID, id int64) (bool, error) {
	result, err := r.db.ExecContext(ctx, `DELETE FROM inventory_items WHERE id=$1 AND branch_id=$2`, id, branchID)
	if err != nil {
		return false, err
	}
	n, err := result.RowsAffected()
	return n > 0, err
}
