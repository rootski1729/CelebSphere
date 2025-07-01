import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { CelebrityProfileDto } from '../celebrity/dto/celebrity.dto';

@Injectable()
export class PdfService {
  async generateCelebrityProfilePdf(celebrity: CelebrityProfileDto): Promise<Buffer> {
    let browser: puppeteer.Browser | null = null;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ],
    });

      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 1600 });
      const htmlContent = this.generatePdfHtml(celebrity);

      await page.setContent(htmlContent, { 
        waitUntil: ['load', 'networkidle0'],
        timeout: 30000,
      });

      const pdfUint8Array = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
            CelebNetwork.com - Celebrity Profile
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
            Generated on ${new Date().toLocaleDateString()} | Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        `,
      });
      return Buffer.from(pdfUint8Array);

    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new InternalServerErrorException('Failed to generate PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private generatePdfHtml(celebrity: CelebrityProfileDto): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${celebrity.name} - Celebrity Profile</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }

          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
            overflow: hidden;
          }

          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
          }

          .profile-image {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            border: 5px solid white;
            margin: 0 auto 20px;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: #999;
            overflow: hidden;
          }

          .profile-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .celebrity-name {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .celebrity-category {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 5px;
          }

          .celebrity-country {
            font-size: 16px;
            opacity: 0.8;
          }

          .verified-badge {
            display: inline-block;
            background: #1DA1F2;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            margin-top: 10px;
          }

          .content {
            padding: 40px;
          }

          .section {
            margin-bottom: 30px;
          }

          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #667eea;
          }

          .bio {
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            text-align: justify;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
          }

          .stat-card {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }

          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
          }

          .stat-label {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .social-links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
          }

          .social-link {
            display: flex;
            align-items: center;
            padding: 15px;
            background: white;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            text-decoration: none;
            color: #333;
        }

          .social-icon {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin-right: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 14px;
        }

          .instagram { background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); }
          .youtube { background: #FF0000; }
          .spotify { background: #1DB954; }

          .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e1e5e9;
        }

          .footer-text {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
        }

          @media print {
            body { margin: 0; }
            .container { box-shadow: none; }
        }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header Section -->
          <div class="header">
            <div class="profile-image">
              ${celebrity.profile_image_url ? 
                `<img src="${celebrity.profile_image_url}" alt="${celebrity.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='👤';" />` : 
                '👤'
              }
            </div>
            <h1 class="celebrity-name">${celebrity.name}</h1>
            <p class="celebrity-category">${celebrity.category}</p>
            <p class="celebrity-country">📍 ${celebrity.country}</p>
            ${celebrity.is_verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
          </div>

          <!-- Content Section -->
          <div class="content">
            <!-- Biography Section -->
            <div class="section">
              <h2 class="section-title">Biography</h2>
              <p class="bio">
                ${celebrity.bio || `${celebrity.name} is a talented ${celebrity.category.toLowerCase()} from ${celebrity.country}. Known for their exceptional work in the entertainment industry, they have built a significant following and continue to inspire fans worldwide.`}
              </p>
            </div>

            <!-- Statistics Section -->
            <div class="section">
              <h2 class="section-title">Statistics & Metrics</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${this.formatNumber(celebrity.fanbase_count)}</div>
                  <div class="stat-label">Total Fanbase</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${this.formatNumber(celebrity.follower_count)}</div>
                  <div class="stat-label">Platform Followers</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${this.formatNumber(celebrity.profile_views)}</div>
                  <div class="stat-label">Profile Views</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${celebrity.engagement_rate.toFixed(1)}%</div>
                  <div class="stat-label">Engagement Rate</div>
                </div>
              </div>
            </div>

            <!-- Social Media Section -->
            <div class="section">
              <h2 class="section-title">Social Media Presence</h2>
              <div class="social-links">
                ${celebrity.instagram_url ? `
                  <div class="social-link">
                    <div class="social-icon instagram">IG</div>
                    <div>
                      <strong>Instagram</strong><br>
                      <small>${celebrity.instagram_url}</small>
                    </div>
                  </div>
                ` : ''}
                
                ${celebrity.youtube_url ? `
                  <div class="social-link">
                    <div class="social-icon youtube">YT</div>
                    <div>
                      <strong>YouTube</strong><br>
                      <small>${celebrity.youtube_url}</small>
                    </div>
                  </div>
                ` : ''}
                
                ${celebrity.spotify_url ? `
                  <div class="social-link">
                    <div class="social-icon spotify">SP</div>
                    <div>
                      <strong>Spotify</strong><br>
                      <small>${celebrity.spotify_url}</small>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Footer Section -->
          <div class="footer">
            <p class="footer-text">
              This profile was generated by CelebNetwork.com
            </p>
            <p class="footer-text">
              Generated on ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p class="footer-text" style="font-size: 12px; color: #999;">
              Profile ID: ${celebrity.id}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}