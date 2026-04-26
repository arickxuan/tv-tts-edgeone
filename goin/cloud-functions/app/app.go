package app

import (
	"goin/router"
	"net/http"

	"github.com/gin-gonic/gin"
)

func NewApp() *gin.Engine {
	r := gin.Default()
	router.NewRouter(r)
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Hello, World!"})
	})
	return r
}
