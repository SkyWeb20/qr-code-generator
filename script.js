class QRCodeGenerator {
    constructor() {
        this.currentType = 'url';
        this.qrCodeData = null;
        this.currentStyle = 'rounded';
        this.currentFrame = 'none';
        this.init();
    }

    init() {
        this.bindEvents();
        this.showForm('url');
    }

    bindEvents() {
        // Type selector buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.selectType(type);
            });
        });

        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generateQRCode();
        });

        // Download buttons
        document.getElementById('download-png').addEventListener('click', () => {
            this.downloadQRCode('png');
        });

        document.getElementById('download-svg').addEventListener('click', () => {
            this.downloadQRCode('svg');
        });

        // Get location button
        document.getElementById('get-location').addEventListener('click', () => {
            this.getCurrentLocation();
        });

        // Style selection
        document.querySelectorAll('.style-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const style = e.currentTarget.dataset.style;
                this.selectStyle(style);
            });
        });

        // Frame selection
        document.querySelectorAll('.frame-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const frame = e.currentTarget.dataset.frame;
                this.selectFrame(frame);
            });
        });

        // Color changes
        document.getElementById('fg-color').addEventListener('change', () => {
            this.updateQRIfExists();
        });

        document.getElementById('bg-color').addEventListener('change', () => {
            this.updateQRIfExists();
        });

        // Input event listeners for real-time validation
        this.addInputValidation();
    }

    selectStyle(style) {
        // Update active style button
        document.querySelectorAll('.style-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-style="${style}"]`).classList.add('active');
        
        this.currentStyle = style;
        this.updateQRIfExists();
    }

    selectFrame(frame) {
        // Update active frame button
        document.querySelectorAll('.frame-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-frame="${frame}"]`).classList.add('active');
        
        this.currentFrame = frame;
        this.updateQRIfExists();
    }

    updateQRIfExists() {
        if (this.qrCodeData && this.qrCodeData.data) {
            // Regenerate QR code with new style
            this.generateQRCode();
        }
    }
    selectType(type) {
        // Update active button
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');

        // Show corresponding form
        this.showForm(type);
        this.currentType = type;
    }

    showForm(type) {
        // Hide all forms
        document.querySelectorAll('.form-group').forEach(form => {
            form.classList.add('hidden');
        });

        // Show selected form
        const targetForm = document.getElementById(`${type}-form`);
        if (targetForm) {
            targetForm.classList.remove('hidden');
        }
    }

    addInputValidation() {
        // Add real-time validation for URL
        const urlInput = document.getElementById('url-input');
        urlInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value && !this.isValidUrl(value)) {
                e.target.style.borderColor = '#e74c3c';
            } else {
                e.target.style.borderColor = '#e0e0e0';
            }
        });

        // Add validation for email
        const emailInput = document.getElementById('email-address');
        emailInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value && !this.isValidEmail(value)) {
                e.target.style.borderColor = '#e74c3c';
            } else {
                e.target.style.borderColor = '#e0e0e0';
            }
        });
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async generateQRCode() {
        const data = this.getFormData();
        
        if (!data) {
            this.showError('لطفاً فیلدهای ضروری را پر کنید');
            return;
        }

        try {
            // Show loading state
            this.showLoading();

            // Get QR code options
            const size = parseInt(document.getElementById('qr-size').value);
            const level = document.getElementById('qr-error-level').value;
            const fgColor = document.getElementById('fg-color').value;
            const bgColor = document.getElementById('bg-color').value;

            // Create QR code with style
            const canvas = this.createStyledQRCode(data, size, level, fgColor, bgColor);

            // Display result
            this.displayQRCode(canvas, data);
            
        } catch (error) {
            console.error('Error generating QR code:', error);
            this.showError('خطا در تولید کیو آر کد. لطفاً دوباره تلاش کنید.');
        }
    }

    getFormData() {
        switch (this.currentType) {
            case 'url':
                return this.getUrlData();
            case 'text':
                return this.getTextData();
            case 'email':
                return this.getEmailData();
            case 'phone':
                return this.getPhoneData();
            case 'sms':
                return this.getSmsData();
            case 'wifi':
                return this.getWifiData();
            case 'vcard':
                return this.getVcardData();
            case 'location':
                return this.getLocationData();
            default:
                return null;
        }
    }

    getUrlData() {
        const url = document.getElementById('url-input').value.trim();
        if (!url) return null;
        
        // Add protocol if missing
        if (!url.match(/^https?:\/\//i)) {
            return 'https://' + url;
        }
        return url;
    }

    getTextData() {
        const text = document.getElementById('text-input').value.trim();
        return text || null;
    }

    getEmailData() {
        const email = document.getElementById('email-address').value.trim();
        if (!email) return null;

        const subject = document.getElementById('email-subject').value.trim();
        const body = document.getElementById('email-body').value.trim();

        let mailtoUrl = `mailto:${email}`;
        const params = [];
        
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        
        if (params.length > 0) {
            mailtoUrl += '?' + params.join('&');
        }
        
        return mailtoUrl;
    }

    getPhoneData() {
        const phone = document.getElementById('phone-number').value.trim();
        return phone ? `tel:${phone}` : null;
    }

    getSmsData() {
        const phone = document.getElementById('sms-number').value.trim();
        if (!phone) return null;

        const message = document.getElementById('sms-message').value.trim();
        
        if (message) {
            return `sms:${phone}?body=${encodeURIComponent(message)}`;
        }
        return `sms:${phone}`;
    }

    getWifiData() {
        const ssid = document.getElementById('wifi-ssid').value.trim();
        if (!ssid) return null;

        const password = document.getElementById('wifi-password').value.trim();
        const security = document.getElementById('wifi-security').value;
        const hidden = document.getElementById('wifi-hidden').checked;

        // WiFi QR code format: WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
        let wifiString = `WIFI:T:${security};S:${ssid};`;
        
        if (password && security !== 'nopass') {
            wifiString += `P:${password};`;
        }
        
        wifiString += `H:${hidden};;`;
        
        return wifiString;
    }

    getVcardData() {
        const name = document.getElementById('vcard-name').value.trim();
        if (!name) return null;

        const org = document.getElementById('vcard-org').value.trim();
        const phone = document.getElementById('vcard-phone').value.trim();
        const email = document.getElementById('vcard-email').value.trim();
        const url = document.getElementById('vcard-url').value.trim();

        let vcard = 'BEGIN:VCARD\n';
        vcard += 'VERSION:3.0\n';
        vcard += `FN:${name}\n`;
        
        if (org) vcard += `ORG:${org}\n`;
        if (phone) vcard += `TEL:${phone}\n`;
        if (email) vcard += `EMAIL:${email}\n`;
        if (url) vcard += `URL:${url}\n`;
        
        vcard += 'END:VCARD';
        
        return vcard;
    }

    getLocationData() {
        const lat = document.getElementById('location-lat').value.trim();
        const lng = document.getElementById('location-lng').value.trim();
        
        if (!lat || !lng) return null;
        
        return `geo:${lat},${lng}`;
    }

    createStyledQRCode(data, size, level, fgColor, bgColor) {
        // Create base QR code
        const qr = new QRious({
            value: data,
            size: size,
            level: level,
            background: bgColor,
            foreground: fgColor
        });

        const canvas = qr.canvas;
        const ctx = canvas.getContext('2d');

        // Apply style based on selection
        if (this.currentStyle !== 'classic') {
            this.applyQRStyle(ctx, canvas, fgColor, bgColor);
        }

        return canvas;
    }

    applyQRStyle(ctx, canvas, fgColor, bgColor) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const size = canvas.width;
        
        // Clear canvas
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        // Calculate module size
        const moduleCount = Math.sqrt(data.length / 4) / 4; // Approximate
        const moduleSize = size / 25; // Approximate for QR structure

        switch (this.currentStyle) {
            case 'rounded':
                this.drawRoundedQR(ctx, imageData, size, fgColor);
                break;
            case 'dotted':
                this.drawDottedQR(ctx, imageData, size, fgColor);
                break;
            case 'gradient':
                this.drawGradientQR(ctx, imageData, size);
                break;
        }
    }

    drawRoundedQR(ctx, imageData, size, fgColor) {
        const data = imageData.data;
        const moduleSize = 12; // Approximate module size
        
        ctx.fillStyle = fgColor;
        
        // Add roundRect polyfill for older browsers
        if (!ctx.roundRect) {
            ctx.roundRect = function(x, y, width, height, radius) {
                this.beginPath();
                this.moveTo(x + radius, y);
                this.lineTo(x + width - radius, y);
                this.quadraticCurveTo(x + width, y, x + width, y + radius);
                this.lineTo(x + width, y + height - radius);
                this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                this.lineTo(x + radius, y + height);
                this.quadraticCurveTo(x, y + height, x, y + height - radius);
                this.lineTo(x, y + radius);
                this.quadraticCurveTo(x, y, x + radius, y);
                this.closePath();
            };
        }
        
        for (let y = 0; y < size; y += moduleSize) {
            for (let x = 0; x < size; x += moduleSize) {
                const i = (y * size + x) * 4;
                const r = data[i];
                
                if (r < 128) { // Dark module
                    ctx.beginPath();
                    ctx.roundRect(x + 1, y + 1, moduleSize - 2, moduleSize - 2, moduleSize / 4);
                    ctx.fill();
                }
            }
        }
    }

    drawDottedQR(ctx, imageData, size, fgColor) {
        const data = imageData.data;
        const moduleSize = 12;
        
        ctx.fillStyle = fgColor;
        
        for (let y = 0; y < size; y += moduleSize) {
            for (let x = 0; x < size; x += moduleSize) {
                const i = (y * size + x) * 4;
                const r = data[i];
                
                if (r < 128) { // Dark module
                    ctx.beginPath();
                    ctx.arc(x + moduleSize/2, y + moduleSize/2, moduleSize/3, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }
    }

    drawGradientQR(ctx, imageData, size) {
        const data = imageData.data;
        const moduleSize = 12;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        ctx.fillStyle = gradient;
        
        for (let y = 0; y < size; y += moduleSize) {
            for (let x = 0; x < size; x += moduleSize) {
                const i = (y * size + x) * 4;
                const r = data[i];
                
                if (r < 128) { // Dark module
                    ctx.fillRect(x + 1, y + 1, moduleSize - 2, moduleSize - 2);
                }
            }
        }
    }

    getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('مکان یابی در این مرورگر پشتیبانی نمی شود');
            return;
        }

        const button = document.getElementById('get-location');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال دریافت مکان...';
        button.disabled = true;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById('location-lat').value = position.coords.latitude.toFixed(6);
                document.getElementById('location-lng').value = position.coords.longitude.toFixed(6);
                button.innerHTML = originalText;
                button.disabled = false;
            },
            (error) => {
                this.showError('عدم امکان دریافت مکان شما. لطفاً مختصات را به صورت دستی وارد کنید.');
                button.innerHTML = originalText;
                button.disabled = false;
            }
        );
    }

    showLoading() {
        const generateBtn = document.getElementById('generate-btn');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<div class="loading"></div> در حال تولید...';
        generateBtn.disabled = true;

        // Reset button after a delay
        setTimeout(() => {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }, 2000);
    }

    displayQRCode(canvas, data) {
        // Hide placeholder and show result
        document.getElementById('qr-placeholder').classList.add('hidden');
        const qrResult = document.getElementById('qr-result');
        qrResult.classList.remove('hidden');
        qrResult.classList.add('show', 'styled');
        
        // Clear previous result
        qrResult.innerHTML = '';
        
        // Create wrapper for frame
        const wrapper = document.createElement('div');
        wrapper.className = 'qr-wrapper';
        
        // Apply frame class
        if (this.currentFrame !== 'none') {
            wrapper.classList.add(`frame-${this.currentFrame}`);
        }
        
        // Add canvas to wrapper
        wrapper.appendChild(canvas);
        qrResult.appendChild(wrapper);
        
        // Store data for download
        this.qrCodeData = { canvas, data };
        
        // Show download section
        document.getElementById('download-section').classList.remove('hidden');
    }

    async downloadQRCode(format) {
        if (!this.qrCodeData) return;

        const { canvas, data } = this.qrCodeData;
        const size = parseInt(document.getElementById('qr-size').value);
        
        try {
            if (format === 'png') {
                // Download as PNG
                const link = document.createElement('a');
                link.download = `qrcode-${this.currentType}-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } else if (format === 'svg') {
                // Create SVG version manually with current style
                const fgColor = document.getElementById('fg-color').value;
                const bgColor = document.getElementById('bg-color').value;
                
                const qr = new QRious({
                    value: data,
                    size: size,
                    level: document.getElementById('qr-error-level').value,
                    background: bgColor,
                    foreground: fgColor
                });
                
                // Convert canvas to SVG (simple approach)
                const imageData = qr.canvas.toDataURL('image/png');
                const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <image width="${size}" height="${size}" xlink:href="${imageData}"/>
</svg>`;
                
                const blob = new Blob([svgString], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `qrcode-${this.currentType}-${Date.now()}.svg`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error downloading QR code:', error);
            this.showError('خطا در دانلود کیو آر کد. لطفاً دوباره تلاش کنید.');
        }
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.getElementById('error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-message';
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #e74c3c;
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 10px 20px rgba(231,76,60,0.3);
                z-index: 1000;
                font-weight: 500;
                max-width: 300px;
                animation: slideInRight 0.3s ease-out;
            `;
            document.body.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (errorDiv && errorDiv.parentNode) {
                        errorDiv.parentNode.removeChild(errorDiv);
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Add CSS animations for error messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the QR code generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new QRCodeGenerator();
});

// Add some helpful utility functions
window.QRUtils = {
    // Copy QR code data to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            return false;
        }
    },

    // Validate various input types
    validateInput(type, value) {
        switch (type) {
            case 'url':
                return /^https?:\/\/.+/.test(value);
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'phone':
                return /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''));
            default:
                return value.trim().length > 0;
        }
    },

    // Format phone numbers
    formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `+1${cleaned}`;
        } else if (cleaned.length === 11 && cleaned[0] === '1') {
            return `+${cleaned}`;
        }
        return phone;
    }
};