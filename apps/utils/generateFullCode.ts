import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const languageToExtension = {
    c: 'c',
    cpp: 'cpp',
    python: 'py',
    java: 'java',
    javascript: 'js',
}

const languageToFileName = {
    c: 'solution',
    cpp: 'solution',
    python: 'solution',
    java: 'Solution',
    javascript: 'solution',
}

function findProjectRoot(startDir: string): string {
    let currentDir = startDir;
    
    while (currentDir !== path.parse(currentDir).root) {
        // Check if turbo.json or pnpm-workspace.yaml exists (monorepo root markers)
        if (fs.existsSync(path.join(currentDir, 'turbo.json')) || 
            fs.existsSync(path.join(currentDir, 'pnpm-workspace.yaml'))) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }
    
    throw new Error('Project root not found');
}

export function generateFullCode(
    source_code: string,
    language: keyof typeof languageToExtension,
    problemName: string
) {
    const projectRoot = findProjectRoot(__dirname);
    const boilerplatePath = path.join(
        projectRoot,
        'apps',
        'problems',
        problemName,
        'boilerplate-full',
        `${languageToFileName[language]}.${languageToExtension[language]}`
    )

    console.log('[generateFullCode] Reading boilerplate from:', boilerplatePath);
    console.log('[generateFullCode] File exists:', require('fs').existsSync(boilerplatePath));
    
    let boilerplateCode = fs.readFileSync(boilerplatePath, 'utf8')
    
    // Log first occurrence of "split" to verify content
    const splitMatch = boilerplateCode.match(/data\.split\([^)]*\)/);
    if (splitMatch) {
        console.log('[generateFullCode] Found split command:', splitMatch[0]);
    }

    // Safely inject user code between markers
    const fullCode = boilerplateCode.replace(
        /(\/\/|#)\s*User Code Starts[\s\S]*?(\/\/|#)\s*User Code Ends/,
        source_code
    )

    // Debug: Log the build_tree function in the final code
    if (problemName === 'Binary-Tree-Inorder-Traversal' && language === 'python') {
        const buildTreeMatch = fullCode.match(/def build_tree[\s\S]{0,500}/);
        if (buildTreeMatch) {
            console.log('[generateFullCode] build_tree function in FINAL code:');
            console.log(buildTreeMatch[0]);
        }
    }

    return fullCode
}