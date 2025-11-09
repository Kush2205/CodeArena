import { config as loadEnv } from 'dotenv';
import prisma from '@repo/db/client';
import { generateTestCases } from './generateTestCases';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);
loadEnv({ path: path.join(__dirname, '..', '..', 'packages', 'db', '.env') });

async function getBoilerPlateCodes(problemName: string) {
     const boilerplateDir = path.join(__dirname, '..' , 'problems' , problemName , 'boilerplate-editor' )
     const files = fs.readdirSync(boilerplateDir);
     const boilerplateCodes: { language: string; code: string }[] = [];
        for (const file of files) {
            const filePath = path.join(boilerplateDir, file);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
                const code = fs.readFileSync(filePath, 'utf-8');
                const language = path.extname(file).slice(1);
                boilerplateCodes.push({ language, code });
            }
        }
        return boilerplateCodes;
}

function getDifficultyFromStructure(problemName: string): string {
    const structureFilePath = path.join(__dirname, '..', 'problems', problemName, 'Structure.md');
    
    if (!fs.existsSync(structureFilePath)) {
        console.warn(`⚠️ Structure.md not found for ${problemName}, defaulting to easy`);
        return 'easy';
    }

    const fileContent = fs.readFileSync(structureFilePath, 'utf-8');
    const lines = fileContent.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('Difficulty :')) {
            const difficulty = trimmedLine.split(':')[1].trim().toLowerCase();
            if (['easy', 'medium', 'hard'].includes(difficulty)) {
                return difficulty;
            }
        }
    }

    console.warn(`⚠️ Difficulty not found in Structure.md for ${problemName}, defaulting to easy`);
    return 'easy';
}

function calculateTotalPoints(difficulty: string, testCaseCount: number): number {
    const pointsMap: Record<string, number> = {
        'easy': 250,
        'medium': 500,
        'hard': 1000,
    };
    return pointsMap[difficulty] || 250;
}

async function seedDatabase() {

     const boilerplateFieldMap: Record<string, string> = {
        "c" : "boilerplateCodeC",
        "cpp" : "boilerplateCodeCpp",
        "js" : "boilerplateCodeJavaScript",
        "py" : "boilerplateCodePython",
        "java" : "boilerplateCodeJava",
     }



    const problemsDir = path.join(__dirname, '..', 'problems');
    console.log('Seeding database from problems directory:', problemsDir);

    const problemNames = fs.readdirSync(problemsDir);
    
    
    for (const problemName of problemNames) {
      const problemPath = path.join(problemsDir, problemName);
        const stat = fs.statSync(problemPath);
        if (stat.isDirectory()) {
            console.log(`Processing problem: ${problemName}`);
            // generateTestCases now only returns test cases 0, 1, and 2
            const testCases = generateTestCases(problemName);
            const boilerplateCodes = await getBoilerPlateCodes(problemName);
            const difficulty = getDifficultyFromStructure(problemName);
            const totalPoints = calculateTotalPoints(difficulty, testCases.length);
            
            console.log(`Test cases to seed for ${problemName}:`, testCases.length);
            console.log(`Difficulty: ${difficulty}, Total Points: ${totalPoints}`);

            await prisma.problem.upsert({
                where: { name: problemName },
                update: {
                    difficulty,
                    totalPoints,
                    testCases: {
                        deleteMany: {},
                        create: testCases,
                    },

                    ...boilerplateCodes.reduce((acc, { language, code }) => {
                        const fieldName = boilerplateFieldMap[language];
                        if (fieldName) {
                            acc[fieldName] = code;
                        }
                        return acc;
                    }, {} as Record<string, string>),
                },
                create: { 
                    name: problemName,
                    difficulty,
                    totalPoints,
                    testCases: {
                        create: testCases,
                    },
                },

                
            });
            
            console.log(`✅ Seeded problem: ${problemName}`);
        }
    }
    
    console.log('✅ Database seeding complete!');
}

async function main() {
    try {
        await seedDatabase();
        await prisma.$disconnect();
        console.log('Disconnected from database');
    } catch (error) {
        console.error('Error seeding database:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();