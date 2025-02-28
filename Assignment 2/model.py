import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
import json

class CDPChatbot:
    def __init__(self, cdp_docs):
        self.cdp_docs = cdp_docs
        self.index = {}
        self.build_index()

    def build_index(self):
        for cdp, url in self.cdp_docs.items():
            self.index[cdp] = {}
            self.crawl_and_index(url, cdp)

    def crawl_and_index(self, start_url, cdp):
        visited = set()
        queue = [start_url]

        while queue:
            url = queue.pop(0)
            if url in visited:
                continue
            visited.add(url)

            try:
                response = requests.get(url)
                response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
                soup = BeautifulSoup(response.content, 'html.parser')

                # Extract text content
                text_content = soup.get_text(separator=' ', strip=True)
                # Cleaning up text content
                text_content = re.sub(r'\s+', ' ', text_content)

                # Indexing relevant content
                if text_content:
                    self.index[cdp][url] = text_content

                # Find and add links to the queue
                for link in soup.find_all('a', href=True):
                    absolute_url = urljoin(url, link['href'])
                    if absolute_url.startswith(self.cdp_docs[cdp]) and absolute_url not in visited:
                        queue.append(absolute_url)

            except requests.exceptions.RequestException as e:
                print(f"Error crawling {url}: {e}")
            except Exception as e:
                print(f"An unexpected error occurred while processing {url}: {e}")

    def search_index(self, cdp, query):
        results = []
        if cdp not in self.index:
            return "CDP not found."

        for url, content in self.index[cdp].items():
            if query.lower() in content.lower():
                results.append((url, content))
        return results

    def answer_question(self, question):
        question = question.lower()

        cdps = {
            "segment": "Segment",
            "mparticle": "mParticle",
            "lytics": "Lytics",
            "zeotap": "Zeotap"
        }

        found_cdp = None
        for cdp_key, cdp_name in cdps.items():
            if cdp_key in question:
                found_cdp = cdp_name
                break

        if not found_cdp:
            return "Please specify which CDP you are asking about (Segment, mParticle, Lytics, or Zeotap)."

        results = self.search_index(found_cdp, question)

        if not results:
            return f"Sorry, I couldn't find information related to your question in {found_cdp} documentation."

        best_result_url, best_result_content = results[0] #Returns the first result.
        # Simple extraction of context.
        context = best_result_content[best_result_content.lower().find(question):best_result_content.lower().find(question) + 500]

        return f"Here's some information from {found_cdp} documentation:\n\n{context}...\n\nFor more details, please visit: {best_result_url}"

    def handle_non_cdp_questions(self, question):
        if any(cdp in question.lower() for cdp in ["segment", "mparticle", "lytics", "zeotap"]):
          return False
        return True

    def cross_cdp_comparison(self, question):
        if "compare" not in question.lower():
          return "This is not a comparison question"

        cdps = ["Segment", "mParticle", "Lytics", "Zeotap"]
        comparison_results = {}

        for cdp in cdps:
            results = self.search_index(cdp, question)
            if results:
                comparison_results[cdp] = results[0][1][:200] + "..." #Get first 200 character of the first result.
            else:
                comparison_results[cdp] = "No information found."

        comparison_message = "Here's a comparison:\n\n"
        for cdp, result in comparison_results.items():
            comparison_message += f"{cdp}: {result}\n\n"

        return comparison_message
# Example Usage
cdp_docs = {
    "Segment": "https://segment.com/docs/",
    "mParticle": "https://docs.mparticle.com/",
    "Lytics": "https://docs.lytics.com/",
    "Zeotap": "https://docs.zeotap.com/home/en-us/"
}

chatbot = CDPChatbot(cdp_docs)

while True:
    user_question = input("Ask a question (or type 'exit'): ")
    if user_question.lower() == "exit":
        break

    if chatbot.handle_non_cdp_questions(user_question):
        print("I can only answer questions about Segment, mParticle, Lytics, or Zeotap.")
        continue

    if "compare" in user_question.lower():
        print(chatbot.cross_cdp_comparison(user_question))
    else:
        print(chatbot.answer_question(user_question))