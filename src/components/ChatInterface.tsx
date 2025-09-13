"use client"

import { useState, useRef, useEffect } from "react"
import { Paperclip, Send, FileText } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  attachments?: File[]
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI assistant. You can send me messages and upload PDF files. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingPdf, setIsUploadingPdf] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const pdfFiles = files.filter(file => file.type === "application/pdf")
    setSelectedFiles(prev => [...prev, ...pdfFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handlePdfUpload = async () => {
    if (selectedFiles.length === 0) return

    // Get auth token from localStorage
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      alert("Please login first")
      return
    }

    if (!sessionId) {
      alert("Please start a conversation first by sending a message")
      return
    }

    setIsUploadingPdf(true)

    try {
      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append("file", file, file.name)
        formData.append("sessionId", sessionId)
        formData.append("authToken", authToken)

        const response = await fetch("/api/upload-pdf", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const uploadMessage: Message = {
            id: Date.now().toString(),
            text: `📄 PDF uploaded successfully: ${file.name}`,
            sender: "bot",
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, uploadMessage])
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to upload PDF")
        }
      }
      
      // Clear selected files after successful upload
      setSelectedFiles([])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `❌ PDF upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsUploadingPdf(false)
    }
  }

  const formatBotResponse = (text: string) => {
    // Check if the response contains research papers or structured content
    if (text.includes('http://arxiv.org/abs/') || text.includes('- ')) {
      const lines = text.split('\n')
      return lines.map((line, index) => {
        if (line.trim().startsWith('- ')) {
          const parts = line.split(' (http://')
          if (parts.length === 2) {
            const title = parts[0].replace('- ', '').trim()
            const url = 'http://' + parts[1].replace(')', '')
            return (
              <div key={index} className="mb-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <div className="font-semibold text-gray-800 mb-2 leading-relaxed">{title}</div>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 hover:underline"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Research Paper
                </a>
              </div>
            )
          }
        }
        return <div key={index} className="mb-2 text-gray-700 leading-relaxed">{line}</div>
      })
    }
    
    // For regular text with URLs, highlight them
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200"
          >
            {part}
          </a>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    // Get auth token from localStorage
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      alert("Please login first")
      return
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, newMessage])
    setInputText("")
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("message", inputText)
      formData.append("sessionId", sessionId)
      formData.append("authToken", authToken)

      const response = await fetch("/api/send-chat", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update session ID if provided in response
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId)
        }
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || "I received your message. Thank you!",
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send message")
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}`,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fadeInUp`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div
              className={`max-w-xs lg:max-w-2xl px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                message.sender === "user"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white transform hover:scale-105"
                  : "bg-white text-gray-800 border border-gray-100 transform hover:scale-105"
              }`}
            >
              <div className="text-sm leading-relaxed">
                {message.sender === "bot" ? formatBotResponse(message.text) : (
                  <span className="font-medium">{message.text}</span>
                )}
              </div>
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3 space-y-1">
                  {message.attachments.map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className="flex items-center space-x-2 text-xs opacity-90 bg-black bg-opacity-10 rounded-lg px-2 py-1"
                    >
                      <FileText size={12} />
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs opacity-70 mt-3 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fadeInUp">
            <div className="bg-white border border-gray-100 text-gray-800 px-6 py-4 rounded-2xl shadow-lg">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">AI is thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Files Display - Only show if user has sent a message */}
      {selectedFiles.length > 0 && sessionId && (
        <div className="px-6 py-4 border-t bg-gradient-to-r from-green-50 to-emerald-50 animate-slideUp">
          <div className="flex flex-wrap gap-3 mb-4">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 bg-white px-4 py-3 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="p-2 bg-red-100 rounded-lg">
                  <FileText size={16} className="text-red-600" />
                </div>
                <span className="text-gray-700 font-medium text-sm">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 hover:bg-red-50 rounded-full"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button
              onClick={handlePdfUpload}
              disabled={isUploadingPdf}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none flex items-center space-x-2"
            >
              {isUploadingPdf ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>📄 Upload PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-6 border-t bg-white">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 text-gray-700 placeholder-gray-400 font-medium"
              disabled={isLoading}
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-4 text-gray-400 hover:text-indigo-600 transition-all duration-300 hover:bg-indigo-50 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !sessionId}
            title={!sessionId ? "Send a message first to upload PDFs" : "Upload PDF"}
          >
            <Paperclip size={20} />
          </button>
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none"
          >
            <Send size={20} />
          </button>
        </div>
        {!sessionId && (
          <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Send a message first to start the conversation and enable PDF uploads
          </p>
        )}
      </form>
    </div>
  )
}
