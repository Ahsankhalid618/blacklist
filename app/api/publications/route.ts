import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import path from 'path';
import { promises as fs } from 'fs';
import { Publication } from '@/types/publication';

export async function GET() {
  try {
    const originalPath = path.join(process.cwd(), 'data', 'PMC_Articles_Data.xlsx');
    const backupPath = path.join(process.cwd(), 'data', 'PMC_Articles_Data_copy.xlsx');
    
    let filePath: string;
    let buffer: Buffer;

    // Try original file first, then backup
    try {
      await fs.access(originalPath);
      filePath = originalPath;
    } catch {
      try {
        await fs.access(backupPath);
        filePath = backupPath;
      } catch {
        return NextResponse.json({ error: 'Excel file not found' }, { status: 404 });
      }
    }

    buffer = await fs.readFile(filePath);
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const publications = data.map((row: any) => {
      // Extract year from publicationDate
      const year = row['Publication Date'] ? 
        parseInt(row['Publication Date'].split(' ')[0]) : // If format is "2017 Apr 11"
        new Date().getFullYear(); // Fallback to current year

      return {
        url: row.URL || '',
        originalTitle: row['Original Title'] || '',
        title: row.Title || '',
        authors: row.Authors ? row.Authors.split(',').map((a: string) => a.trim()) : [],
        correspondingAuthorEmail: row['Corresponding Author Email'] || '',
        journal: row.Journal || '',
        publicationDate: row['Publication Date'] || '',
        year: year,
        volume: row.Volume || '',
        issue: row.Issue || '',
        pages: row.Pages || '',
        doi: row.DOI || '',
        pmcid: row.PMCID || '',
        pmid: row.PMID || '',
        abstract: row.Abstract || '',
        citation: row.Citation || '',
        fullTextAvailable: row['Full Text Available'] === 'Yes',
        scrapingSuccess: row['Scraping Success'] === 'Yes',
        error: row.Error || undefined,
        sections: [
          {
            name: row['Section_1_Name'] || '',
            content: row['Section_1_Content'] || ''
          },
          {
            name: row['Section_2_Name'] || '',
            content: row['Section_2_Content'] || ''
          },
          {
            name: row['Section_3_Name'] || '',
            content: row['Section_3_Content'] || ''
          }
        ].filter(section => section.name !== '')
      };
    });

    return NextResponse.json({ publications });
  } catch (error) {
    console.error('Error loading publications:', error);
    return NextResponse.json({ error: 'Failed to load publications' }, { status: 500 });
  }
}