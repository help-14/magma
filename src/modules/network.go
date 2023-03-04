package modules

import (
	"net"
	"net/http"
	"strings"
)

func ClientIsLocal(r *http.Request) bool {
	IPAddress := net.ParseIP(r.Header.Get("X-Real-Ip"))
	if IPAddress == nil {
		IPAddress = net.ParseIP(r.Header.Get("X-Forwarded-For"))
	}
	if IPAddress == nil {
		IPAddress = net.ParseIP(strings.Split(r.RemoteAddr, ":")[0])
	}
	return IPAddress.IsPrivate()
}
