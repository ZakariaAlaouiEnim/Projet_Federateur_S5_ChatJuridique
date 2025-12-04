import os
from typing import List
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings

# Global variable to hold the vector store in memory for simplicity
# In production, you might want to load this on startup or use a persistent server
vector_store = None
FAISS_INDEX_PATH = "faiss_index"

def get_embeddings():
    if not settings.GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY is not set")
    return GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=settings.GOOGLE_API_KEY)

def ingest_document(file_path: str):
    global vector_store
    
    # 1. Load Document
    if file_path.endswith(".pdf"):
        loader = PyPDFLoader(file_path)
    else:
        loader = TextLoader(file_path)
    
    docs = loader.load()
    
    # 2. Split Text
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    
    # 3. Embed and Store
    embeddings = get_embeddings()
    
    if os.path.exists(FAISS_INDEX_PATH):
        vector_store = FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
        vector_store.add_documents(splits)
    else:
        vector_store = FAISS.from_documents(splits, embeddings)
    
    vector_store.save_local(FAISS_INDEX_PATH)
    return len(splits)

def get_rag_chain():
    global vector_store
    embeddings = get_embeddings()
    
    if vector_store is None:
        if os.path.exists(FAISS_INDEX_PATH):
            vector_store = FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
        else:
            raise ValueError("Vector store not found. Please ingest documents first.")
            
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=settings.GOOGLE_API_KEY, temperature=0)
    
    prompt = ChatPromptTemplate.from_template("""
    You are an expert Moroccan Legal Assistant named Jurid-AI.
    Answer the user's question based ONLY on the following context. 
    If the answer is not in the context, say "I do not have enough information in my legal database to answer this question."
    Always cite the specific article numbers or source titles if available in the context.
    
    Context:
    {context}
    
    Question: {input}
    """)
    
    document_chain = create_stuff_documents_chain(llm, prompt)
    retriever = vector_store.as_retriever()
    retrieval_chain = create_retrieval_chain(retriever, document_chain)
    
    return retrieval_chain

def query_rag(input_text: str):
    chain = get_rag_chain()
    response = chain.invoke({"input": input_text})
    return response
