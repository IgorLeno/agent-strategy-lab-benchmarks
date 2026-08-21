// Command stream processes a JSONL event file into a summary and a rejection
// log.
//
// Usage:
//
//	stream process --input <file> --outdir <dir> [--buffer-size <bytes>]
//
// Exit codes: 0 success, 1 processing failure, 2 usage error.
package main

import (
	"flag"
	"fmt"
	"os"

	"stream/internal/pipeline"
)

const usage = `usage: stream process --input <file> --outdir <dir> [--buffer-size <bytes>]

commands:
  process   read a JSONL event file and write summary.json and rejects.jsonl

flags:
  --input        path to the JSONL input file (required)
  --outdir       directory to write summary.json and rejects.jsonl into (required)
  --buffer-size  read buffer in bytes (default 65536, minimum 1024)
`

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}

func run(args []string, stdout, stderr *os.File) int {
	if len(args) == 0 || args[0] != "process" {
		fmt.Fprint(stderr, usage)
		return 2
	}

	flags := flag.NewFlagSet("process", flag.ContinueOnError)
	flags.SetOutput(stderr)
	input := flags.String("input", "", "path to the JSONL input file")
	outdir := flags.String("outdir", "", "output directory")
	bufferSize := flags.Int("buffer-size", pipeline.DefaultBufferSize, "read buffer in bytes")
	if err := flags.Parse(args[1:]); err != nil {
		return 2
	}

	if *input == "" || *outdir == "" {
		fmt.Fprint(stderr, usage)
		return 2
	}

	result, err := pipeline.Run(pipeline.Options{
		InputPath:  *input,
		OutDir:     *outdir,
		BufferSize: *bufferSize,
	})
	if err != nil {
		fmt.Fprintf(stderr, "error: %v\n", err)
		return 1
	}

	fmt.Fprintf(
		stdout,
		"processed %d lines: %d accepted, %d rejected\n",
		result.Summary.Input.LinesRead,
		result.Summary.Events.Accepted,
		result.Summary.Events.Rejected,
	)
	return 0
}
