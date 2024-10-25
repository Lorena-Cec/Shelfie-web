import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-orange-800 text-white py-8 px-32 pt-12">
      <div className="container mx-auto grid grid-cols-1  md:grid-cols-3 gap-8">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="hover:text-gray-300">
                Home
              </a>
            </li>
            <li>
              <a href="/bestsellers" className="hover:text-gray-300">
                Bestsellers
              </a>
            </li>
            <li>
              <a href="/categories" className="hover:text-gray-300">
                Categories
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-gray-300">
                Contact Us
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-gray-300">
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col">
          <h3 className="text-xl font-bold mb-4">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li>
              Email:{' '}
              <a
                href="mailto:support@bookshelf.com"
                className="hover:text-gray-300"
              >
                support@shelfie.com
              </a>
            </li>
            <li>
              Phone:{' '}
              <a href="tel:+123456789" className="hover:text-gray-300">
                +123 456 789
              </a>
            </li>
            <li>
              Follow us on:
              <div className="flex space-x-3 mt-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  className="hover:text-gray-300"
                  rel="noreferrer"
                >
                  Facebook
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  className="hover:text-gray-300"
                  rel="noreferrer"
                >
                  Instagram
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  className="hover:text-gray-300"
                  rel="noreferrer"
                >
                  Twitter
                </a>
              </div>
            </li>
          </ul>
        </div>
        <div className="flex flex-col pr-10">
          <h3 className="text-xl font-bold mb-4">About Us</h3>
          <p className="text-sm">
            Welcome to our book tracking platform, where you can shelf your
            books, track your reading progress, and explore the latest
            bestsellers. Stay tuned for exciting features and a wide selection
            of genres!
          </p>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} Shelfie. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
