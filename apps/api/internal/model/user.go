package model

type User struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Name     string `json:"name"`
	Username string `json:"username"`
	Email    string `json:"email"`
}
