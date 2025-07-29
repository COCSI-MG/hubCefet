import { Injectable, Logger } from '@nestjs/common';
import { PdfGenerationJobData } from '../interfaces/pdf-generation-job.interface';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfGenerationService {
  private readonly logger = new Logger(PdfGenerationService.name);

  async generateCertificatePdf(jobData: PdfGenerationJobData): Promise<string> {
    try {
      const storageDir = process.env.PDF_STORAGE_PATH || './storage/certificates';
      await this.validateStorageDirectory(storageDir);

      const fileName = `certificado_${jobData.presenceId}_${Date.now()}.pdf`;
      const filePath = join(storageDir, fileName);

      const htmlContent = await this.generateHtmlContent(jobData);
      const pdfBuffer = await this.generatePdfFromHtml(htmlContent);
      
      await fs.writeFile(filePath, pdfBuffer);

      this.logger.log(`[ASYNC] PDF gerado com sucesso: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error(`[ASYNC] Erro ao gerar PDF: ${error.message}`);
      throw error;
    }
  }

  private async validateStorageDirectory(dirPath: string): Promise<void> {
    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        throw new Error(`Caminho especificado não é um diretório: ${dirPath}`);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(dirPath, { recursive: true });
        this.logger.log(`[PDF] Diretório criado: ${dirPath}`);
      } else {
        throw error;
      }
    }
  }

  private async generateHtmlContent(jobData: PdfGenerationJobData): Promise<string> {
    try {
      // Tenta primeiro o caminho de produção (dist), depois o de desenvolvimento (src)
      const templatePaths = [
        join(__dirname, '../templates/certificate.html'),
        join(process.cwd(), 'src/queues/templates/certificate.html'),
        join(process.cwd(), 'dist/queues/templates/certificate.html')
      ];

      let htmlTemplate: string;
      let templateFound = false;

      for (const templatePath of templatePaths) {
        try {
          htmlTemplate = await fs.readFile(templatePath, 'utf-8');
          templateFound = true;
          this.logger.log(`[PDF] Template encontrado em: ${templatePath}`);
          break;
        } catch (error) {
          continue;
        }
      }

      if (!templateFound) {
        throw new Error('Template HTML não encontrado em nenhum dos caminhos esperados');
      }

      const replacements = await this.buildTemplateReplacements(jobData);
      
      return this.replaceTemplateVariables(htmlTemplate, replacements);
    } catch (error) {
      this.logger.error(`[PDF] Erro ao gerar HTML: ${error.message}`);
      throw new Error(`Falha ao processar template HTML: ${error.message}`);
    }
  }

  private async buildTemplateReplacements(jobData: PdfGenerationJobData): Promise<Record<string, string>> {
    const checkInDate = this.formatDateToBrazilian(jobData.checkInDate);
    const checkOutDate = this.formatDateToBrazilian(jobData.checkOutDate);
    const currentDate = this.formatDateToBrazilian(new Date().toISOString());
    
    const imagePath = await this.findImagesDirectory();

    const headerImage = await this.imageToBase64(join(imagePath, 'header_sepex.png'));
    const mariaSignature = await this.imageToBase64(join(imagePath, 'assinatura_maria_flow.png'));
    const renataSignature = await this.imageToBase64(join(imagePath, 'assinatura_renata_flow.png'));
    const footerImage = await this.imageToBase64(join(imagePath, 'final_text_sepex.png'));

    return {
      '{{userName}}': jobData.userName || 'Nome não informado',
      '{{eventName}}': jobData.eventName || 'Evento não informado',
      '{{totalHours}}': jobData.totalHours?.toString() || '0',
      '{{checkInDate}}': checkInDate,
      '{{checkOutDate}}': checkOutDate,
      '{{currentDate}}': currentDate,
      '{{headerImage}}': headerImage,
      '{{mariaSignature}}': mariaSignature,
      '{{renataSignature}}': renataSignature,
      '{{footerImage}}': footerImage,
    };
  }

  private async findImagesDirectory(): Promise<string> {
    const possibleImagePaths = [
      join(process.cwd(), 'storage/assets/images'),
      join(process.cwd(), 'dist/storage/assets/images'),
      join(__dirname, '../../storage/assets/images'),
      join(__dirname, '../../../storage/assets/images')
    ];
    
    for (const path of possibleImagePaths) {
      try {
        const fs = require('fs');
        const stats = fs.statSync(path);
        if (stats.isDirectory()) {
          const files = fs.readdirSync(path);
          return path;
        }
      } catch (error) {
        this.logger.log(`[PDF] ❌ Caminho não existe: ${path} - ${error.message}`);
      }
    }
    
    throw new Error('Diretório de imagens não encontrado');
  }

  private async imageToBase64(imagePath: string): Promise<string> {
    try {
      const imageBuffer = await fs.readFile(imagePath);

      const base64 = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(imagePath);
      const dataUrl = `data:${mimeType};base64,${base64}`;
      
      return dataUrl;
    } catch (error) {
      this.logger.error(`[PDF] ERRO ao carregar imagem ${imagePath}: ${error.message}`);
      return error.message;
    }
  }

  private getMimeType(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      default:
        return 'image/png';
    }
  }

  private replaceTemplateVariables(template: string, replacements: Record<string, string>): string {
    const result = Object.entries(replacements).reduce(
      (html, [placeholder, value]) => html.replace(new RegExp(placeholder, 'g'), value),
      template
    );
    
    const hasImages = result.includes('data:image/');
    
    if (hasImages) {
      const imageCount = (result.match(/data:image\//g) || []).length;
    }
    
    return result;
  }

  private formatDateToBrazilian(dateString: string): string {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Sao_Paulo'
      };
      
      return new Intl.DateTimeFormat('pt-BR', options).format(date);
    } catch (error) {
      this.logger.warn(`[PDF] Erro ao formatar data: ${dateString}. Usando data atual.`);
      return new Date().toLocaleDateString('pt-BR');
    }
  }

  private async generatePdfFromHtml(htmlContent: string): Promise<Buffer> {
    let browser: puppeteer.Browser | null = null;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--force-device-scale-factor=1'
        ]
      });

      const page = await browser.newPage();
      
      await page.setViewport({
        width: 1123,
        height: 794,
        deviceScaleFactor: 1
      });
      
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        }
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`[PDF] Erro no Puppeteer: ${error.message}`);
      throw new Error(`Falha na geração do PDF: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
} 