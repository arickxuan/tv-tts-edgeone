package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func apiRouter(router *gin.RouterGroup) {
	v1 := router.Group("/api")
	v1.GET("/v1/ping", pingHandler)

}

func pingHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "pong"})
}
