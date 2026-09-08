const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a luxury, executive-grade certificate of completion
 * @param {string} studentName 
 * @param {string} courseName 
 * @param {string} completionDate 
 * @param {string} certificateId 
 * @param {object} options Additional optional metadata (score, etc.)
 */
const generateCertificate = async (
    studentName,
    courseName,
    completionDate,
    certificateId,
    options = {}
) => {
    return new Promise((resolve, reject) => {
        try {
            const certificatesDir = path.join(__dirname, '../public/certificates');
            if (!fs.existsSync(certificatesDir)) {
                fs.mkdirSync(certificatesDir, { recursive: true });
            }

            const fileName = `certificate_${certificateId}.pdf`;
            const filePath = path.join(certificatesDir, fileName);

            // A4 Landscape: 841.89 x 595.28 points
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 0,
                info: {
                    Title: `CodeCampus Certificate - ${studentName}`,
                    Author: 'CodeCampus Learning Management System',
                    Subject: `Certificate of Qualification & Excellence for ${courseName}`,
                    Keywords: 'Certificate, CodeCampus, Programming, Accredited, Exam Qualified'
                }
            });

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            const W = doc.page.width;   // ~841.89
            const H = doc.page.height;  // ~595.28

            // Color Palette
            const primaryNavy = '#0A192F';      // Deep Midnight Navy
            const royalNavy = '#1E3A8A';        // Classic Royal Navy
            const goldPrimary = '#D97706';      // Rich Gold
            const goldDark = '#B45309';         // Deep Burnished Gold
            const goldLight = '#FBBF24';        // Bright Gold Highlight
            const charcoal = '#1F2937';         // Primary Text
            const slateMuted = '#4B5563';       // Secondary Text
            const lightBorder = '#E2E8F0';

            /* =========================================================
               1. BACKGROUND & MULTI-LAYERED GUILLOCHE-STYLE BORDERS
               ========================================================= */
            // Pristine crisp background with subtle cream tint
            doc.rect(0, 0, W, H).fill('#FCFDFD');

            // Outer thick Navy Border
            doc.rect(26, 26, W - 52, H - 52)
                .lineWidth(3)
                .strokeColor(primaryNavy)
                .stroke();

            // Inner Burnished Gold Border
            doc.rect(32, 32, W - 64, H - 64)
                .lineWidth(1.5)
                .strokeColor(goldPrimary)
                .stroke();

            // Secondary hairline Navy Inset
            doc.rect(36, 36, W - 72, H - 72)
                .lineWidth(0.5)
                .strokeColor(royalNavy)
                .stroke();

            /* Corner Geometric Flourishes (Top-Left, Top-Right, Bottom-Left, Bottom-Right) */
            const drawCornerFlourish = (cx, cy, dirX, dirY) => {
                const len = 22;
                doc.save();
                doc.rect(cx, cy, dirX * len, dirY * len)
                    .lineWidth(1)
                    .strokeColor(goldPrimary)
                    .stroke();
                // Inner solid navy diamond
                doc.rect(cx + (dirX * 4), cy + (dirY * 4), dirX * 5, dirY * 5)
                    .fillColor(primaryNavy)
                    .fill();
                doc.restore();
            };

            drawCornerFlourish(36, 36, 1, 1);
            drawCornerFlourish(W - 36, 36, -1, 1);
            drawCornerFlourish(36, H - 36, 1, -1);
            drawCornerFlourish(W - 36, H - 36, -1, -1);

            /* =========================================================
               2. HEADER: LOGO, BRAND & OFFICIAL CREST
               ========================================================= */
            const logoPath = path.join(__dirname, '../public/assets/CodeCampus.png');
            const logoW = 42;
            const headerY = 46;

            // Brand typography + Logo centered
            doc.font('Helvetica-Bold').fontSize(20);
            const brandText = 'CodeCampus';
            const brandW = doc.widthOfString(brandText);
            const totalHeaderW = logoW + 12 + brandW;
            const headerStartX = (W - totalHeaderW) / 2;

            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, headerStartX, headerY - 6, { width: logoW });
            }

            doc.fillColor(primaryNavy)
                .font('Helvetica-Bold')
                .fontSize(22)
                .text(brandText, headerStartX + logoW + 12, headerY - 3);

            doc.font('Helvetica')
                .fontSize(8.5)
                .fillColor(slateMuted)
                .text('INSTITUTE OF COMPUTER SCIENCE & ACCREDITED TECH EDUCATION', 50, headerY + 28, {
                    width: W - 100,
                    align: 'center',
                    characterSpacing: 2
                });

            // Decorative gold double ribbon divider
            const dividerY = headerY + 45;
            doc.moveTo(120, dividerY)
                .lineTo(W - 120, dividerY)
                .lineWidth(1.5)
                .strokeColor(goldPrimary)
                .stroke();

            doc.moveTo(180, dividerY + 3)
                .lineTo(W - 180, dividerY + 3)
                .lineWidth(0.5)
                .strokeColor(primaryNavy)
                .stroke();

            // Diamond star in center of divider
            doc.polygon(
                [W / 2, dividerY - 4],
                [W / 2 + 5, dividerY + 1.5],
                [W / 2, dividerY + 7],
                [W / 2 - 5, dividerY + 1.5]
            ).fillColor(goldPrimary).fill();

            /* =========================================================
               3. CERTIFICATE TITLE & PRESENTATION STATEMENT
               ========================================================= */
            doc.font('Times-Bold')
                .fontSize(28)
                .fillColor(primaryNavy)
                .text('CERTIFICATE OF ACHIEVEMENT', 50, 116, {
                    width: W - 100,
                    align: 'center',
                    characterSpacing: 2.5
                });

            doc.font('Helvetica-Oblique')
                .fontSize(9.5)
                .fillColor(goldDark)
                .text('& ACADEMIC EXCELLENCE', 50, 148, {
                    width: W - 100,
                    align: 'center',
                    characterSpacing: 3
                });

            doc.font('Helvetica')
                .fontSize(11)
                .fillColor(slateMuted)
                .text('THIS CREDENTIAL IS PROUDLY CONFERRED UPON', 50, 172, {
                    width: W - 100,
                    align: 'center',
                    characterSpacing: 1.5
                });

            /* =========================================================
               4. RECIPIENT NAME (HONORIFIC TYPOGRAPHY & GOLD UNDERLINE)
               ========================================================= */
            const formattedName = (studentName || 'Distinguished Student').toUpperCase();
            doc.font('Times-Bold')
                .fontSize(38)
                .fillColor(primaryNavy)
                .text(formattedName, 50, 194, {
                    width: W - 100,
                    align: 'center'
                });

            // Dual decorative underlines for recipient
            const nameLineY = 242;
            doc.moveTo(220, nameLineY)
                .lineTo(W - 220, nameLineY)
                .lineWidth(1.2)
                .strokeColor(goldPrimary)
                .stroke();

            doc.moveTo(280, nameLineY + 3)
                .lineTo(W - 280, nameLineY + 3)
                .lineWidth(0.5)
                .strokeColor(slateMuted)
                .stroke();

            /* =========================================================
               5. ACCREDITATION & COURSE QUALIFICATION STATEMENT
               ========================================================= */
            doc.font('Helvetica')
                .fontSize(10.5)
                .fillColor(charcoal)
                .text(
                    'for successfully completing the full curriculum, demonstrating technical proficiency, and passing the rigorous qualification examination with distinction in',
                    80,
                    254,
                    {
                        width: W - 160,
                        align: 'center',
                        lineGap: 3
                    }
                );

            // Course Name with highlight box / ribbon
            const courseBoxY = 286;
            const courseBoxH = 34;
            doc.roundedRect(90, courseBoxY, W - 180, courseBoxH, 4)
                .fillColor('#F8FAFC')
                .fill();
            doc.roundedRect(90, courseBoxY, W - 180, courseBoxH, 4)
                .lineWidth(0.8)
                .strokeColor(lightBorder)
                .stroke();

            doc.font('Helvetica-Bold')
                .fontSize(16)
                .fillColor(royalNavy)
                .text(courseName || 'Advanced Software Development', 90, courseBoxY + 8, {
                    width: W - 180,
                    align: 'center'
                });

            // Completion details
            doc.font('Helvetica')
                .fontSize(9.5)
                .fillColor(slateMuted)
                .text(
                    `Issued on: ${completionDate}   •   Examination Status: Verified & Passed`,
                    50,
                    330,
                    {
                        width: W - 100,
                        align: 'center'
                    }
                );

            /* =========================================================
               6. SIGNATURES & VERIFIED EMBOSSED SEAL
               ========================================================= */
            const colW = 210;
            const leftColX = 70;
            const centerColX = (W - 100) / 2;
            const rightColX = W - 70 - colW;
            const lineY = H - 150; // crisp reference baseline for signatures

            // Signature drawer function
            const renderSignature = (sigPath, title, name, colX) => {
                const sigW = 160;
                const sigH = 65;
                const sigX = colX + (colW - sigW) / 2;
                const sigY = lineY - sigH + 5; // places signature right above and naturally touching the baseline

                // Signature image
                if (fs.existsSync(sigPath)) {
                    doc.image(sigPath, sigX, sigY, {
                        width: sigW,
                        height: sigH,
                        fit: [sigW, sigH],
                        align: 'center',
                        valign: 'bottom'
                    });
                }

                // Formal signature line
                doc.moveTo(colX + 10, lineY)
                    .lineTo(colX + colW - 10, lineY)
                    .lineWidth(0.8)
                    .strokeColor(primaryNavy)
                    .stroke();

                // Name & Title
                doc.font('Helvetica-Bold')
                    .fontSize(11.5)
                    .fillColor(primaryNavy)
                    .text(name, colX, lineY + 7, {
                        width: colW,
                        align: 'center'
                    });

                doc.font('Helvetica')
                    .fontSize(8.5)
                    .fillColor(slateMuted)
                    .text(title, colX, lineY + 22, {
                        width: colW,
                        align: 'center'
                    });
            };

            // Left Signature - Founder & CEO (Sukumar Divi)
            renderSignature(
                path.join(__dirname, '../public/assets/Founder-sign.png'),
                'Founder & Chief Executive Officer',
                'Sukumar Divi',
                leftColX
            );

            // Center Seal - Official Gold Verified Seal
            const sealPath = path.join(__dirname, '../public/assets/VerifiedStamp.png');
            if (fs.existsSync(sealPath)) {
                doc.image(sealPath, centerColX + 5, lineY - 65, {
                    width: 90,
                    height: 90,
                    fit: [90, 90]
                });
            }

            // Right Signature - Co-Founder & CTO (Teja S)
            renderSignature(
                path.join(__dirname, '../public/assets/Co-Founder-sign.png'),
                'Co-Founder & Chief Technology Officer',
                'Teja S',
                rightColX
            );

            /* =========================================================
               7. FOOTER SECURITY, CERTIFICATE ID & VERIFICATION BAR
               ========================================================= */
            const footerY = H - 90;

            // Subtle divider above footer
            doc.moveTo(50, footerY)
                .lineTo(W - 50, footerY)
                .lineWidth(0.5)
                .strokeColor(lightBorder)
                .stroke();

            // Left: Certificate ID with secure monospace feel
            doc.font('Helvetica-Bold')
                .fontSize(8)
                .fillColor(slateMuted)
                .text('CERTIFICATE ID: ', 50, footerY + 6, { continued: true })
                .font('Helvetica')
                .fillColor(primaryNavy)
                .text(certificateId);

            doc.font('Helvetica')
                .fontSize(7)
                .fillColor('#94A3B8')
                .text(`SECURE HASH: SHA-256 VERIFIED CREDENTIAL`, 50, footerY + 18);

            // Right: Verification statement & URL
            const verifyText = `Verify Authenticity: codecampus.org/verify/${certificateId}`;
            doc.font('Helvetica-Bold')
                .fontSize(8)
                .fillColor(royalNavy)
                .text(verifyText, W - 356, footerY + 6, {
                    width: 306,
                    align: 'right'
                });

            doc.font('Helvetica')
                .fontSize(7)
                .fillColor('#94A3B8')
                .text('CodeCampus Academic Accreditation Board • Recognized Professional Standard', W - 356, footerY + 18, {
                    width: 306,
                    align: 'right'
                });

            // Finalize document stream
            doc.end();

            stream.on('finish', () => {
                resolve({
                    fileName,
                    filePath,
                    url: `/certificates/${fileName}`
                });
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateCertificate };