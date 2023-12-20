package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username string `gorm:"uniqueIndex;type:varchar(100);not null"`
	Password string `gorm:"type:varchar(100);not null"`
	Session  Session
}
