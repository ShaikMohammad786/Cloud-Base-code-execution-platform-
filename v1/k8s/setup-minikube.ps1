# ============================================================
# Minikube Setup Script for Cloud Code Execution Platform
# ============================================================
# This script sets up a local Minikube Kubernetes cluster
# with ingress support and builds the runner Docker image.
# 
# Prerequisites:
#   - Docker Desktop installed and running
#   - minikube installed (winget install Kubernetes.minikube)
#   - kubectl installed
#
# Usage: Run as Administrator (needed for minikube tunnel)
#   .\setup-minikube.ps1
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Minikube Setup - CloudCode Platform" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# --- Step 1: Check if Minikube is already running ---
Write-Host "`n[1/5] Checking Minikube status..." -ForegroundColor Yellow
$status = minikube status --format='{{.Host}}' 2>$null
if ($status -eq "Running") {
    Write-Host "  Minikube is already running." -ForegroundColor Green
} else {
    Write-Host "  Starting Minikube with Docker driver..." -ForegroundColor Yellow
    minikube start --driver=docker --cpus=4 --memory=4096
    Write-Host "  Minikube started successfully!" -ForegroundColor Green
}

# --- Step 2: Enable Ingress Addon ---
Write-Host "`n[2/5] Enabling Ingress addon..." -ForegroundColor Yellow
minikube addons enable ingress
Write-Host "  Ingress addon enabled." -ForegroundColor Green

# --- Step 3: Wait for Ingress Controller to be ready ---
Write-Host "`n[3/5] Waiting for Ingress Controller to be ready..." -ForegroundColor Yellow
kubectl wait --namespace ingress-nginx `
    --for=condition=ready pod `
    --selector=app.kubernetes.io/component=controller `
    --timeout=120s
Write-Host "  Ingress Controller is ready!" -ForegroundColor Green

# --- Step 4: Build Runner Docker Image inside Minikube ---
Write-Host "`n[4/5] Building Runner Docker image inside Minikube..." -ForegroundColor Yellow

# Point Docker CLI to Minikube's Docker daemon
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
# If the script is at k8s/setup-minikube.ps1, project root is two levels up
# But let's be safe and check relative to the script location
$runnerDir = Join-Path (Split-Path -Parent $PSScriptRoot) "runner"
if (-not (Test-Path $runnerDir)) {
    # Try from the k8s directory (script is at k8s/setup-minikube.ps1)
    $runnerDir = Join-Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) "runner"
}
if (-not (Test-Path $runnerDir)) {
    # Fallback: assume we're running from the project root
    $runnerDir = ".\runner"
}

Write-Host "  Building from: $runnerDir" -ForegroundColor Gray
docker build -t skmohammad/runner:latest $runnerDir
Write-Host "  Runner image built successfully!" -ForegroundColor Green

# --- Step 5: Start Minikube Tunnel ---
Write-Host "`n[5/5] Starting Minikube Tunnel..." -ForegroundColor Yellow
Write-Host "  This allows Ingress to be accessible at 127.0.0.1" -ForegroundColor Gray
Write-Host "  Keep this terminal open! Press Ctrl+C to stop." -ForegroundColor Red
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Setup Complete! Tunnel starting..." -ForegroundColor Green
Write-Host " Don't forget to add hosts entries:" -ForegroundColor Yellow
Write-Host "   .\k8s\add-host.ps1 <replId>" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

minikube tunnel
