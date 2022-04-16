package modules

import (
	"io"
	"log"
	"os"
	"os/exec"
)

func CopyFile(src, dst string) {
	fin, err := os.Open(src)
	if err != nil {
		log.Fatal(err)
	}
	defer fin.Close()

	fout, err := os.Create(dst)
	if err != nil {
		log.Fatal(err)
	}
	defer fout.Close()

	_, err = io.Copy(fout, fin)

	if err != nil {
		log.Fatal(err)
	}
}

func CopyDirectory(oldDir, newDir string) {
	cmd := exec.Command("cp", "--recursive", oldDir, newDir)
	cmd.Run()
}
