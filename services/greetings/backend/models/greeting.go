package models

import "gorm.io/gorm"

type Greeting struct {
	gorm.Model
	UserID      uint   `gorm:"index;not null"`
	User        User   `gorm:"foreignKey:UserID"`
	Filename    string `gorm:"type:varchar(255);not null"`
	Description string `gorm:"type:varchar(255);not null"`
}
