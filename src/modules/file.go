package modules

import (
	"fmt"
	"io"
	"net/http"
	"os"
)

func Exists(path string) bool {
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		return true
	}
	return false
}

func CopyFile(source string, dest string) (err error) {
	sourcefile, err := os.Open(source)
	if err != nil {
		return err
	}

	defer sourcefile.Close()

	destfile, err := os.Create(dest)
	if err != nil {
		return err
	}

	defer destfile.Close()

	_, err = io.Copy(destfile, sourcefile)
	if err == nil {
		sourceinfo, err := os.Stat(source)
		if err != nil {
			err = os.Chmod(dest, sourceinfo.Mode())
		}

	}
	return
}

func CopyDir(source string, dest string, override bool) (err error) {
	// get properties of source dir
	sourceinfo, err := os.Stat(source)
	if err != nil {
		return err
	}

	// create dest dir
	err = os.MkdirAll(dest, sourceinfo.Mode())
	if err != nil {
		return err
	}

	directory, _ := os.Open(source)
	objects, err := directory.Readdir(-1)
	for _, obj := range objects {
		sourcefilepointer := source + "/" + obj.Name()
		destinationfilepointer := dest + "/" + obj.Name()
		if obj.IsDir() {
			// create sub-directories - recursively
			err = CopyDir(sourcefilepointer, destinationfilepointer, override)
			if err != nil {
				fmt.Println(err)
			}
		} else {
			// perform copy
			if !Exists(destinationfilepointer) || (Exists(destinationfilepointer) && override) {
				err = CopyFile(sourcefilepointer, destinationfilepointer)
				if err != nil {
					fmt.Println(err)
				}
			}
		}
	}
	return
}

func DownloadFile(url string, filePath string) bool {
	out, err := os.Create(filePath)
	if err != nil {
		return false
	}
	defer out.Close()

	resp, err := http.Get(url)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	w, err := io.Copy(out, resp.Body)
	if err != nil {
		return false
	}

	fmt.Printf("Downloaded %d bytes from "+url+"\n", w)
	return true
}
