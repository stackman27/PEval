import uuid
import time
import threading
import re
import os
import json

from flask import Flask, jsonify, request
from flask_cors import CORS
from urllib.parse import unquote
from my_module.agent import GPT35Agent
from my_module.agent_settings import AgentSettings
from my_module.role import Role
from my_module.initial_prompt import InitialPrompt
app = Flask(__name__)
CORS(app)

results = {}

# Prompt versioning
PROMPTS_DIR = os.path.join(os.path.dirname(__file__), "prompts")
ACTIVE_VERSIONS = {"staging": None, "prod": None}
EVAL_SCORES = {}

@app.route("/api/initial-prompts", methods=["GET"])
def get_items():
    prompts = [
        InitialPrompt("Assistant", "You are a helpful assistant."),
        InitialPrompt("Friend", "You are a person and my friend.  Only respond as a person.  Always stay in character."),
        InitialPrompt("Star Trek Game", """
- You are a text adventure game where I'm the captain of the USS Enterprise from Star Trek The Next Generation.  My crew will be the entire crew from the show.  You describe the world and situation to me in great detail using atleast 1000 words and then present me with many various options to pick, just like a choose your own adventure game.  Try to give a very large variety of very different options. This game never ends, it just keeps going. If even the play dies, there will be options for how to continue.
- Add lots and lots of dialogue between characters to make the story more interactive and engaging.  Make the diaglog match the personalities.
- Describe the characters' actions, emotions, motivations, desires, and thoughts in detail to give a more complete picture of the situation.
- Create an immersive environment by describing the setting, atmosphere, and sensory details in the story, sights, sounds, smells, etc.
- Add humor and suspense to keep the reader engaged and interested in the story.
- Don't just say what happens.  Tell the actual actions and dialog that occurs.  Spend time on little details. Move the story forward slowly. Describe scene in various ways from different viewpoints.
- Do not be repeatative.  Do not necessarily show every character's reaction every time. Spend more time on some and then on others as we go.                      
"""),
        
    ]
    return jsonify([{"name": prompt.name, "prompt": prompt.prompt} for prompt in prompts])

@app.route("/api/prompts", methods=["GET"])
def get_prompts():
    """Get all prompt versions"""
    prompts = []
    
    # Load prompts from files first
    if os.path.exists(PROMPTS_DIR):
        for filename in os.listdir(PROMPTS_DIR):
            if filename.endswith(".json"):
                filepath = os.path.join(PROMPTS_DIR, filename)
                try:
                    with open(filepath, "r") as f:
                        prompt_data = json.load(f)
                        prompts.append(prompt_data)
                except Exception as e:
                    print(f"Error loading prompt {filename}: {e}")
    
    # Always include default sample prompts (only if not already loaded from files)
    existing_versions = {p.get("version") for p in prompts}
    default_prompts = [
        {
            "name": "Helpful Assistant",
            "version": "v1",
            "prompt": "You are a helpful, friendly, and knowledgeable assistant. Provide clear, concise, and accurate responses. Be conversational but professional."
        },
        {
            "name": "Technical Expert",
            "version": "v2",
            "prompt": "You are a technical expert with deep knowledge in software engineering, programming, and system design. Provide detailed, technical explanations with code examples when relevant. Be precise and thorough."
        },
        {
            "name": "Creative Writer",
            "version": "v3",
            "prompt": "You are a creative writing assistant. Help users craft engaging stories, develop characters, and refine their writing style. Be imaginative, supportive, and provide constructive feedback."
        },
        {
            "name": "Business Consultant",
            "version": "v4",
            "prompt": "You are a business consultant with expertise in strategy, operations, and growth. Provide actionable insights, analyze business problems, and suggest practical solutions. Be professional and data-driven."
        },
        {
            "name": "Code Reviewer",
            "version": "v5",
            "prompt": "You are an expert code reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and best practices. Provide specific, actionable feedback with examples of improvements."
        },
        {
            "name": "Customer Support",
            "version": "v6",
            "prompt": "You are a customer support representative. Be empathetic, patient, and solution-oriented. Help customers resolve their issues efficiently while maintaining a friendly and professional tone."
        },
        {
            "name": "Data Analyst",
            "version": "v7",
            "prompt": "You are a data analyst expert. Help users understand data, create insights, and make data-driven decisions. Explain statistical concepts clearly and provide practical analysis guidance."
        },
        {
            "name": "Product Manager",
            "version": "v8",
            "prompt": "You are a product management expert. Help with product strategy, feature prioritization, user research, and roadmap planning. Think strategically and consider user needs and business goals."
        }
    ]
    
    # Load additional prompts from files
    if os.path.exists(PROMPTS_DIR):
        for filename in os.listdir(PROMPTS_DIR):
            if filename.endswith(".json"):
                filepath = os.path.join(PROMPTS_DIR, filename)
                try:
                    with open(filepath, "r") as f:
                        prompt_data = json.load(f)
                        # Only add if not already in default prompts (by version)
                        if not any(p["version"] == prompt_data.get("version") for p in default_prompts):
                            prompts.append(prompt_data)
                except Exception as e:
                    print(f"Error loading prompt {filename}: {e}")
    
    # Combine default prompts with file-based prompts
    all_prompts = default_prompts + prompts
    
    return jsonify({"prompts": all_prompts})

@app.route("/api/prompts", methods=["POST"])
def create_prompt():
    """Create a new prompt"""
    data = request.get_json()
    name = data.get("name", "").strip()
    prompt_content = data.get("prompt", "").strip()
    version = data.get("version", "").strip()
    
    if not name or not prompt_content:
        return jsonify({"error": "Name and prompt content are required"}), 400
    
    # Generate version if not provided
    if not version:
        # Find the highest version number from existing prompts
        existing_versions = []
        if os.path.exists(PROMPTS_DIR):
            for filename in os.listdir(PROMPTS_DIR):
                if filename.startswith("assistant_") and filename.endswith(".json"):
                    try:
                        version_num = filename.replace("assistant_v", "").replace(".json", "")
                        if version_num.isdigit():
                            existing_versions.append(int(version_num))
                    except:
                        pass
        
        # Also check default prompts
        default_versions = [1, 2, 3, 4, 5, 6, 7, 8]
        all_versions = existing_versions + default_versions
        next_version = max(all_versions) + 1 if all_versions else 1
        version = f"v{next_version}"
    
    # Create prompt data
    prompt_data = {
        "name": name,
        "version": version,
        "prompt": prompt_content
    }
    
    # Save to file
    if not os.path.exists(PROMPTS_DIR):
        os.makedirs(PROMPTS_DIR)
    
    filename = f"assistant_{version.replace('v', '')}.json"
    filepath = os.path.join(PROMPTS_DIR, filename)
    
    try:
        with open(filepath, "w") as f:
            json.dump(prompt_data, f, indent=2)
        return jsonify({"status": "ok", "prompt": prompt_data})
    except Exception as e:
        return jsonify({"error": f"Failed to save prompt: {str(e)}"}), 500

@app.route("/api/prompts/<version>", methods=["PUT"])
def update_prompt(version):
    """Update an existing prompt"""
    data = request.get_json()
    name = data.get("name", "").strip()
    prompt_content = data.get("prompt", "").strip()
    
    if not name or not prompt_content:
        return jsonify({"error": "Name and prompt content are required"}), 400
    
    # Find the file
    filename = f"assistant_{version.replace('v', '')}.json"
    filepath = os.path.join(PROMPTS_DIR, filename)
    
    if not os.path.exists(filepath):
        return jsonify({"error": "Prompt not found"}), 404
    
    # Update prompt data
    prompt_data = {
        "name": name,
        "version": version,
        "prompt": prompt_content
    }
    
    try:
        with open(filepath, "w") as f:
            json.dump(prompt_data, f, indent=2)
        return jsonify({"status": "ok", "prompt": prompt_data})
    except Exception as e:
        return jsonify({"error": f"Failed to update prompt: {str(e)}"}), 500

@app.route("/api/prompts/active", methods=["GET"])
def get_active_versions():
    """Get active versions for staging and production"""
    return jsonify(ACTIVE_VERSIONS)

@app.route("/api/prompts/active", methods=["POST"])
def set_active_version():
    """Set active version for staging or production"""
    data = request.get_json()
    environment = data.get("environment")
    version = data.get("version")
    
    if environment in ACTIVE_VERSIONS:
        ACTIVE_VERSIONS[environment] = version
        return jsonify({"status": "ok", "environment": environment, "version": version})
    return jsonify({"error": "Invalid environment"}), 400

@app.route("/api/evals/scores", methods=["GET"])
def get_eval_scores():
    """Get evaluation scores for all versions"""
    return jsonify(EVAL_SCORES)

@app.route("/api/evals/run", methods=["POST"])
def run_eval():
    """Run evaluation for a prompt version"""
    data = request.get_json()
    version = data.get("version")
    
    # Mock evaluation - in real implementation, this would run actual tests
    # For now, return a mock score
    score = 75.0 + (hash(version) % 25)  # Random score between 75-100
    EVAL_SCORES[version] = score
    
    return jsonify({
        "status": "ok",
        "version": version,
        "score": score,
        "summary": {
            "prompt_name": f"Prompt {version}",
            "prompt_version": version,
            "average_score": score,
            "total_fixtures": 10,
            "results": []
        }
    })

@app.route("/api/prompts/publish", methods=["POST"])
def publish_prompt():
    """Publish staging version to production"""
    data = request.get_json()
    version = data.get("version")
    
    staging_score = EVAL_SCORES.get(ACTIVE_VERSIONS.get("staging"), 0)
    prod_score = EVAL_SCORES.get(ACTIVE_VERSIONS.get("prod"), 0)
    
    if staging_score < prod_score:
        return jsonify({"error": "Staging score must be higher than production score"}), 400
    
    ACTIVE_VERSIONS["prod"] = version
    return jsonify({"status": "ok", "version": version})

def process_stream(result_id, response_stream):
    current_result = ""
    for chunk in response_stream:
        current_result += chunk
                
        with app.app_context():
            results[result_id] = {
                'message': current_result,
                'completed': False
            }

    with app.app_context():
        results[result_id] = {
            'message': current_result,
            'completed': True
        }

@app.route('/api/messages', methods=['POST'])
def add_message():
    data = request.get_json()
    content = unquote(data['content'])
    
    agent.add_user_message(content) 
    response_stream = agent.step_session_stream()
    
    result_id = str(uuid.uuid4())
    results[result_id] = {'message': "", 'completed': False}
    
    thread = threading.Thread(target=process_stream, args=(result_id, response_stream,))
    thread.start()

    response = jsonify({"result_id": result_id})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

@app.route('/api/results/<string:result_id>', methods=['GET'])
def get_result(result_id):
    result = results.get(result_id)
    if result:
        return jsonify(result)
    else:
        return jsonify({"error": "Result not found"}), 404

@app.route('/api/messages/clear', methods=['POST'])
def clear_messages():
    agent.clear_messages()
    return jsonify({'status': 'ok'})

@app.route('/api/system-message', methods=['GET'])
def get_system_message():
    result = jsonify({'message': agent.system_message.content})
    return result;

@app.route('/api/system-message', methods=['POST'])
def set_system_message():
    data = request.get_json()
    prompt = (data['prompt'])
    role = data.get('role', Role.SYSTEM.value)
    agent.set_system_message(prompt, role)
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    instructions = """
    You answer questions based on a provided context.
"""
    settings = AgentSettings(instructions, "summaryAgent", 2000, 3000, 0.0, 3900)
    agent = GPT35Agent(settings)
    app.run(debug=True)