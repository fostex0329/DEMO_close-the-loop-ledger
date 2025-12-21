import { spawn } from 'child_process';
import path from 'path';

// Architecture Change:
// Due to Node.js v23 native module incompatibility with DuckDB,
// we proxy queries through a Python script using the project's venv.

const PYTHON_SCRIPT_PATH = path.join(process.cwd(), 'src', 'lib', 'query_duckdb.py');
// Assuming .venv is in the project root (one level up from web/)
const PYTHON_BIN_PATH = path.join(process.cwd(), '..', '.venv', 'bin', 'python');

export async function query(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    // Spawn python process using venv interpreter
    const python = spawn(PYTHON_BIN_PATH, [PYTHON_SCRIPT_PATH]);
    
    let stdoutData = '';
    let stderrData = '';

    // Send payload to stdin
    const payload = JSON.stringify({ sql, params });
    python.stdin.write(payload);
    python.stdin.end();

    // Collect stdout
    python.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    // Collect stderr
    python.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python script exited with code ${code}: ${stderrData}`));
      }

      try {
        if (!stdoutData.trim()) {
           // No output? Should assume empty or error if not caught above
           return resolve([]);
        }
        
        const result = JSON.parse(stdoutData);
        
        if (result.error) {
          return reject(new Error(result.error));
        }
        
        resolve(result.data || []);
      } catch (e) {
        reject(new Error(`Failed to parse Python output: ${e}, Raw: ${stdoutData}, Stderr: ${stderrData}`));
      }
    });
    
    python.on('error', (err) => {
        reject(new Error(`Failed to spawn python process: ${err.message}`));
    });

  });
}
