#!/usr/bin/env node

/**
 * Port Management Utility for Old K Sports
 * 
 * This utility helps manage port assignments and conflicts for the development environment.
 * It automatically finds available ports in the 5170-5180 range and provides configuration.
 * 
 * Usage:
 * - node port-manager.js check     # Check current port usage
 * - node port-manager.js find      # Find available port in 5170-5180 range
 * - node port-manager.js kill      # Kill processes using project ports
 * - node port-manager.js config    # Generate configuration for available ports
 */

import { execSync } from 'child_process';
import readline from 'readline';

const PORT_RANGE = { start: 5170, end: 5180 };
const PROJECT_PORTS = [5170, 5171, 5172, 5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180];

class PortManager {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  // Check if a port is available
  isPortAvailable(port) {
    try {
      execSync(`netstat -ano | findstr :${port}`, { stdio: 'pipe' });
      return false; // Port is in use
    } catch (error) {
      return true; // Port is available
    }
  }

  // Get all port usage in the range
  checkPortUsage() {
    console.log('\n🔍 Checking port usage in 5170-5180 range:\n');
    
    PROJECT_PORTS.forEach(port => {
      const available = this.isPortAvailable(port);
      const status = available ? '✅ Available' : '🔴 In Use';
      const processInfo = this.getPortProcessInfo(port);
      
      console.log(`Port ${port}: ${status} ${processInfo}`);
    });
    
    console.log('\n');
  }

  // Get process information for a port
  getPortProcessInfo(port) {
    try {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: 'pipe' });
      const lines = output.trim().split('\n');
      if (lines.length > 0 && lines[0]) {
        const parts = lines[0].split(/\s+/);
        const pid = parts[parts.length - 1];
        const processName = this.getProcessName(pid);
        return `(PID: ${pid} - ${processName})`;
      }
    } catch (error) {
      return '';
    }
    return '';
  }

  // Get process name from PID
  getProcessName(pid) {
    try {
      const output = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV`, { encoding: 'utf8', stdio: 'pipe' });
      const lines = output.trim().split('\n');
      if (lines.length > 1) {
        const parts = lines[1].split(',');
        if (parts.length > 1) {
          return parts[1].replace(/"/g, '');
        }
      }
    } catch (error) {
      return 'Unknown';
    }
    return 'Unknown';
  }

  // Find available port in the range
  findAvailablePort() {
    console.log('🔍 Finding available ports in 5170-5180 range...\n');
    
    const availablePorts = PROJECT_PORTS.filter(port => this.isPortAvailable(port));
    
    if (availablePorts.length === 0) {
      console.log('❌ No available ports in the 5170-5180 range');
      return null;
    }
    
    console.log('✅ Available ports:', availablePorts.join(', '));
    return availablePorts[0]; // Return first available port
  }

  // Kill processes using project ports
  killPortProcesses() {
    console.log('⚠️  About to kill processes using project ports...\n');
    this.checkPortUsage();
    
    this.question('Do you want to continue killing these processes? (y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        PROJECT_PORTS.forEach(port => {
          if (!this.isPortAvailable(port)) {
            const pid = this.getPortPID(port);
            if (pid) {
              try {
                execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
                console.log(`✅ Killed process ${pid} on port ${port}`);
              } catch (error) {
                console.log(`� Failed to kill process ${pid} on port ${port}`);
              }
            }
          }
        });
        console.log('\n✅ Port cleanup completed');
      } else {
        console.log('❌ Port cleanup cancelled');
      }
      this.rl.close();
    });
  }

  // Get PID from port
  getPortPID(port) {
    try {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: 'pipe' });
      const lines = output.trim().split('\n');
      if (lines.length > 0 && lines[0]) {
        const parts = lines[0].split(/\s+/);
        return parts[parts.length - 1];
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  // Generate configuration
  generateConfig() {
    const availablePort = this.findAvailablePort();
    
    if (availablePort) {
      const config = {
        availablePort,
        frontendUrl: `http://localhost:${availablePort}`,
        backendUrl: 'http://localhost:3005',
        corsOrigins: [],
        portRange: PORT_RANGE,
        recommendation: `Use port ${availablePort} for frontend development`
      };

      // Generate CORS origins for the range
      for (let port = PORT_RANGE.start; port <= PORT_RANGE.end; port++) {
        config.corsOrigins.push(`http://localhost:${port}`);
      }

      console.log('\n📋 Generated Configuration:\n');
      console.log(JSON.stringify(config, null, 2));
      
      console.log('\n💡 Recommended Usage:');
      console.log(`Frontend: ${config.frontendUrl}`);
      console.log(`Backend:  ${config.backendUrl}`);
      console.log(`CORS will be configured for ports ${PORT_RANGE.start}-${PORT_RANGE.end}`);
      
      return config;
    } else {
      console.log('❌ No available ports for configuration');
      return null;
    }
  }

  // Ask user a question
  question(query, callback) {
    this.rl.question(query, callback);
  }

  // Main command handler
  handleCommand(command) {
    switch (command) {
      case 'check':
        this.checkPortUsage();
        break;
      case 'find':
        this.findAvailablePort();
        break;
      case 'kill':
        this.killPortProcesses();
        break;
      case 'config':
        this.generateConfig();
        break;
      default:
        console.log('Unknown command. Available commands: check, find, kill, config');
    }
    this.rl.close();
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new PortManager();
  const command = process.argv[2] || 'check';
  
  if (command === 'help') {
    console.log(`
Port Management Utility for Old K Sports

Usage:
  node port-manager.js [command]

Commands:
  check     - Check current port usage in 5170-5180 range
  find      - Find available port in 5170-5180 range  
  kill      - Kill processes using project ports
  config    - Generate configuration for available ports
  help      - Show this help message

Examples:
  node port-manager.js check
  node port-manager.js find
  node port-manager.js config
    `);
    process.exit(0);
  }
  
  manager.handleCommand(command);
}

export default PortManager;