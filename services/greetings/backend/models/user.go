package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	ID        int64  `gorm:"autoIncrement;uniqueIndex;not null"`
	Username string `gorm:"uniqueIndex;type:varchar(100);not null"`
	Password string `gorm:"type:varchar(100);not null"`
	Session Session
}