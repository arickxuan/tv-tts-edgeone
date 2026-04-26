package main

import (
	"goin/router"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func NewApp() *gin.Engine {
	r := gin.Default()
	router.NewRouter(r.Group("/"))
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Hello, World!"})
	})
	return r
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	NewApp().Run(":" + port)
}
