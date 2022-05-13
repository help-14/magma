package docker

import "net/http"

func Setup() {
	http.HandleFunc("/addons/docker", listContainers)
}

func listContainers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`[]`))
}
