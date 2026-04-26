package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func difyXrsRouter(router *gin.Engine) *gin.RouterGroup {
	v1 := router.Group("/dify")
	v1.POST("/v1/chat/completions", difyXrsHandler)
	v1.GET("/v1/models", difyXrsHandler)

	v1.POST("/v1/images/edits", difyXrsHandler)
	v1.POST("/v1/images/variations", difyXrsHandler)
	v1.POST("/v1/images/searches", difyXrsHandler)

	v1.POST("/anthpic/v1/messages", difyXrsHandler)
	v1.GET("/anthpic/v1/models", difyXrsHandler)
	return v1
}

func difyXrsHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Hello, World!"})
}
