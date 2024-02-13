import React from 'react';

const QrGenerator = ({ qrImage }) => {
    return (
        <div>
            {/* <h2>Generated QR Code</h2> */}
            <div>
                <img src={qrImage} alt="qrImage" style={{ width: '100%', maxWidth: '180px', height: 'auto' }} />
            </div>
        </div>
    );
}

export default QrGenerator;


