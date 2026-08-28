package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"

	"golang.org/x/crypto/bcrypt"
	"y/internal/database"
)

func main() {
	username := flag.String("username", "", "ชื่อผู้ใช้ admin")
	password := flag.String("password", "", "รหัสผ่าน admin")
	name := flag.String("name", "ผู้ดูแลระบบ", "ชื่อที่แสดง")
	flag.Parse()
	if *username == "" || *password == "" {
		log.Fatal("ต้องระบุ -username และ -password")
	}
	db, err := database.Open(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil || db == nil {
		log.Fatalf("เชื่อมต่อฐานข้อมูลไม่สำเร็จ: %v", err)
	}
	defer db.Close()
	hash, err := bcrypt.GenerateFromPassword([]byte(*password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("เข้ารหัสรหัสผ่านไม่สำเร็จ: %v", err)
	}
	var id int64
	err = db.QueryRow(`INSERT INTO users(name,username,email,password_hash,role) VALUES($1,$2,$3,$4,'admin') ON CONFLICT (email) DO NOTHING RETURNING id`, *name, *username, fmt.Sprintf("%s@local.admin", *username), string(hash)).Scan(&id)
	if err != nil {
		log.Fatal("ไม่สามารถสร้าง admin ได้ (อาจมีผู้ใช้นี้อยู่แล้ว)")
	}
	log.Printf("สร้าง admin สำเร็จ: id=%d username=%s", id, *username)
}
