import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[linear-gradient(0deg,white,black)] text-white py-5 mt-auto">
      <div className="container mx-auto text-center text-sm">
        <p className="text-gray-100">
          © Copyright {new Date().getFullYear()} - Raththi's Art. All Rights Reserved.
        </p>
        <p className="mt-1 text-black font-medium">
          Website Design and Development by{' '}
          <a
            
            target="_blank"
            rel="noopener noreferrer"
            className="text-black font-medium hover:text-gray-800 hover:font-bold"
          >
            CoderWizard
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
