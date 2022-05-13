package healthcheckserver

import "net/http"

func Setup() {
	http.HandleFunc("/addons/health-check", listHealthCheck)
}

func listHealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`[]`))
}
