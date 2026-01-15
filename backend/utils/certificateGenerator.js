const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateCertificate = async (
    studentName,
    courseName,
    completionDate,
    certificateId,
    instructorName = 'Course Instructor'
) => {
    return new Promise((resolve, reject) => {
        try {
            const certificatesDir = path.join(__dirname, '../public/certificates');
            if (!fs.existsSync(certificatesDir)) {
                fs.mkdirSync(certificatesDir, { recursive: true });
            }

            const fileName = `certificate_${certificateId}.pdf`;
            const filePath = path.join(certificatesDir, fileName);

            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 0
            });

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            const W = doc.page.width;
            const H = doc.page.height;

            /* ================= BACKGROUND ================= */
            doc.fillColor('#FFFFFF').rect(0, 0, W, H).fill();

            // Top gold line
            doc.fillColor('#F59E0B').rect(0, 0, W, 6).fill();

            // Left border
            doc.fillColor('#1E40AF').rect(0, 0, 10, H).fill();

            // Right border
            doc.fillColor('#1E40AF').rect(W - 10, 0, 10, H).fill();

            // Bottom border
            doc.fillColor('#1E40AF').rect(0, H - 10, W, 10).fill();

            /* ================= HEADER SECTION ================= */
            const logoPath = path.join(__dirname, '../public/assets/CodeCampus.png');

            const logoW = 46;
            const y = 22;
            const gap = 12;

            doc.font('Helvetica-Bold').fontSize(22);
            const textW = doc.widthOfString('CodeCampus');
            const x = (W - (logoW + gap + textW)) / 2;

            fs.existsSync(logoPath) && doc.image(logoPath, x, y, { width: logoW });

            doc.fillColor('#1E40AF')
                .text('CodeCampus', x + logoW + gap, y + 6);

            doc.font('Helvetica')
                .fontSize(10)
                .fillColor('#6B7280')
                .text('Learn Without Limits', x + logoW + gap, y + 32, {
                    width: textW,
                    align: 'center'
                });



            /* ================= DIVIDER LINE ================= */
            doc.moveTo(50, 95)
                .lineTo(W - 50, 95)
                .strokeColor('#F59E0B')
                .lineWidth(3)
                .stroke();

            /* ================= CERTIFICATE TITLE ================= */
            /* ================= TITLE + NAME BLOCK ================= */
            const startY = 150;
            const gap1 = 40;
            doc.font('Helvetica')
                .fontSize(14)
                .fillColor('#6B7280')
                .text(
                    'This Certificate is Proudly Presented to',
                    50,
                    startY,
                    { width: W - 100, align: 'center' }
                );

            doc.font('Times-Bold')
                .fontSize(52)
                .fillColor('#1E40AF')
                .text(
                    studentName.toUpperCase(),
                    50,
                    startY + gap1,
                    { width: W - 100, align: 'center' }
                );


            /* ================= ACHIEVEMENT TEXT ================= */
            doc.font('Helvetica')
                .fontSize(13)
                .fillColor('#374151')
                .text('For successfully completing and demonstrating excellence in', 50, 290, {
                    align: 'center',
                    width: W - 100
                });

            /* ================= COURSE NAME ================= */
            doc.font('Helvetica-Bold')
                .fontSize(16)
                .fillColor('#F59E0B')
                .text(courseName, 50, 320, {
                    align: 'center',
                    width: W - 100
                });

            /* ================= COMPLETION DATE ================= */
            doc.font('Helvetica')
                .fontSize(11)
                .fillColor('#6B7280')
                .text(`Completed on: ${completionDate}`, 50, 360, {
                    align: 'center',
                    width: W - 100
                });

            /* ================= SIGNATURE'S & SEAL ROW ================= */
            const signY = H - 190;
            const blockWidth = 200;

            const positions = {
                left: 80,
                center: W / 2 - 40,
                right: W - 280
            };

            const drawSignature = (imgPath, role, name, x) => {
                if (fs.existsSync(imgPath)) {
                    doc.image(imgPath, x + 40, signY - 55, { width: 110 });
                }

                doc.font('Helvetica')
                    .fontSize(10)
                    .fillColor('#374151')
                    .text(role, x, signY + 20, {
                        width: blockWidth,
                        align: 'center'
                    });

                doc.font('Helvetica-Bold')
                    .fontSize(11)
                    .fillColor('#1E40AF')
                    .text(name, x, signY + 36, {
                        width: blockWidth,
                        align: 'center'
                    });
            };

            /* ---------- LEFT : Founder ---------- */
            drawSignature(
                path.join(__dirname, '../public/assets/Founder.png'),
                'Founder & CEO',
                'Sukumar Divi',
                positions.left
            );

            /* ---------- CENTER : VERIFIED SEAL ---------- */
            const sealPath = path.join(__dirname, '../public/assets/VerifiedStamp.png');
            fs.existsSync(sealPath) &&
                doc.image(sealPath, positions.center, signY - 20, { width: 80 });

            /* ---------- RIGHT : Co-Founder ---------- */
            drawSignature(
                path.join(__dirname, '../public/assets/Co-Founder.png'),
                'Co-Founder & CTO',
                'Rajitha B',
                positions.right
            );




            /* ================= FOOTER ================= */
            doc.moveTo(50, H - 40)
                .lineTo(W - 50, H - 40)
                .strokeColor('#E5E7EB')
                .lineWidth(1)
                .stroke();

            doc.font('Helvetica')
                .fontSize(8)
                .fillColor('#9CA3AF')
                .text(`Certificate ID: ${certificateId}`, 50, H - 32);

            doc.font('Helvetica')
                .fontSize(8)
                .fillColor('#9CA3AF')
                .text(
                    'This certificate verifies successful completion and is a digital credential recognized by CodeCampus.',
                    50,
                    H - 20,
                    {
                        width: W - 100,
                        align: 'center'
                    }
                );

            doc.end();

            stream.on('finish', () => {
                resolve({
                    fileName,
                    filePath,
                    url: `/certificates/${fileName}`
                });
            });

            stream.on('error', reject);

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateCertificate };