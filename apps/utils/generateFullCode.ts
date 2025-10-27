import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const languageToExtension = {
    cpp: 'cpp',
    python: 'py',
    java: 'java',
    javascript: 'js',
}

const languageToFileName = {
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

    let boilerplateCode = fs.readFileSync(boilerplatePath, 'utf8')

    // Remove BOM + hidden characters
    boilerplateCode = boilerplateCode.replace(/^\uFEFF/, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

    // Clean user code as well
    const cleanSource = source_code.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()

    // Safely inject user code between markers
    const fullCode = boilerplateCode.replace(
        /(\/\/|#)\s*User Code Starts[\s\S]*?(\/\/|#)\s*User Code Ends/,
        cleanSource
    )

    return fullCode
}