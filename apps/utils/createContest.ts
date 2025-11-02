import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import prisma from '@repo/db/client';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



async function generateContest(contestName: string){
    const contestDir = path.join(__dirname, '..', 'contests', contestName);
    const dataFilePath = path.join(contestDir, 'data.txt');

    if (!fs.existsSync(dataFilePath)) {
        throw new Error(`Data file not found for contest: ${contestName}`);
    }

    const problemNames = fs.readFileSync(dataFilePath, 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    const existing = await prisma.contest.findUnique({
        where: { name: contestName },
    });

    if (existing) {
        console.log(`Contest "${contestName}" already exists in the database.`);
        return existing;
    }
   

    const res = await prisma.contest.create({
        data: {
            name: contestName,
            problems: {
                create: problemNames.map(name => ({
                    problem: {
                        connectOrCreate: {
                            where: { name },
                            create: { name },
                        },
                    },
                })),
            },
            started: false,
            StartTime: new Date("2025-10-28T10:00:00Z"),
            EndTime: new Date("2025-11-28T12:00:00Z"),

        },
    });
        

    return res;
}


async function runFromCommandLine() {
    const contestName = process.argv[2];
    if (!contestName) {
        console.error('Please provide a contest name as an argument.');
        process.exit(1);
    }

    try {
        const problems = await generateContest(contestName);
        console.log(`Problems in ${contestName}:`, problems);
    } catch (error) {
        console.error('Error generating contest:', error);
    }
}

runFromCommandLine();