# Makefile for Portale von Molthar Swift Package

.PHONY: all build run test clean xcode format

all: build

# Build the Swift package
build:
	swift build

# Run the Swift package
run:
	swift run

# Run the unit tests
test:
	swift test

# Clean the build artifacts
clean:
	rm -rf .build

# Generate an Xcode project (Optional, for older workflows or specific IDE integrations)
xcode:
	swift package generate-xcodeproj

# Format the Swift code (requires swift-format to be installed)
format:
	swift format --in-place -r Sources Tests
