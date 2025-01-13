import React from 'react'
import { FaInstagram, FaEnvelope } from 'react-icons/fa'
import logo from '../assets/logo.png'

export default function About() {
  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-900">
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
        <div className="relative h-[300px] bg-gradient-to-r from-indigo-900 to-purple-900 py-12"> {/* Added py-12 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white tracking-wider"> {/* Added tracking-wider */}
              About Raththika Prasanna
            </h1>
          </div>
        </div>
        
        <div className="p-8">
          <div className="prose prose-invert max-w-none">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={logo}
                alt="Raththika Prasanna"
                className="w-24 h-24 rounded-full object-cover ring-2 ring-purple-500"
              />
              <div className="flex space-x-6">
                <a 
                  href="mailto:raththi00@gmail.com" 
                  className="p-2 rounded-full transition-transform hover:scale-110"
                  style={{ color: '#EA4335' }}  // Gmail red
                >
                  <FaEnvelope className="w-8 h-8" />
                </a>
                <a 
                  href="https://www.instagram.com/raththika_prasanna/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 rounded-full transition-transform hover:scale-110"
                >
                  <div className="relative group">
                    <FaInstagram className="w-8 h-8 text-white" 
                      style={{
                        background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%,#d6249f 60%,#285AEB 90%)',
                        borderRadius: '8px',
                        padding: '2px'
                      }}
                    />
                  </div>
                </a>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-white">About the Artist</h2>
            <p className="mb-6 text-gray-300">
              Raththika Prasanna is a passionate artist who specializes in creating unique and 
              inspiring artworks. Her creative journey is marked by dedication to her craft and 
              a distinctive artistic style that captivates viewers.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-white">Artistic Vision</h2>
            <p className="mb-6 text-gray-300">
              Through her art, Raththika explores various themes and techniques, bringing her 
              unique perspective to each piece she creates. Her work reflects both traditional 
              influences and contemporary interpretations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
