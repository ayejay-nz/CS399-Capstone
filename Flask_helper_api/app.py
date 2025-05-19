from flask import Flask, request, send_file, jsonify
from docxtpl import DocxTemplate
import io

app = Flask(__name__)
TEMPLATE_PATH = 'Coverpage.docx'

@app.route('/ping', methods=['GET'])
def ping():
    return "pong"

@app.route('/generate-coverpage', methods=['POST'])
def generate_coverpage():
    
    if not request.is_json:
        return jsonify(error="Expected JSON"), 400
    context = request.get_json()

    try:
        tpl = DocxTemplate(TEMPLATE_PATH)
    except Exception as e:
        return jsonify(error=f"Cannot open template: {e}"), 500

    tpl.render(context)

    buf = io.BytesIO()
    tpl.save(buf)
    buf.seek(0)
    return send_file(
        buf,
        as_attachment=True,
        download_name='Coverpage.docx',
        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )

if __name__ == '__main__':
    app.run(debug=True)
