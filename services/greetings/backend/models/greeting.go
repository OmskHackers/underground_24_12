package models

import "gorm.io/gorm"

type Greeting struct {
	gorm.Model
	UserID      uint   `gorm:"index;not null"`
	User        User   `gorm:"foreignKey:UserID"`
	Description string `gorm:"type:varchar(255);not null"`
}
