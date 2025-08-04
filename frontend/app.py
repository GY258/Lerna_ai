import streamlit as st
import requests

st.title("AI Restaurant Training Demo")

sop_topic = st.text_input("SOP Topic")
sop_text = st.text_area("Paste your SOP content here")

quiz_data = []
responses = []

if st.button("Generate Quiz"):
    with st.spinner("Generating quiz from SOP..."):
        response = requests.post(
            "http://localhost:8000/generate_quiz/",
            data={"sop_text": sop_text, "topic": sop_topic}
        )
        quiz_data = response.json().get("quiz", [])
        st.session_state["quiz_data"] = quiz_data

if "quiz_data" in st.session_state and st.session_state.quiz_data:
    st.subheader("Answer the questions:")
    quiz_data = st.session_state.quiz_data
    responses.clear()

    for idx, q in enumerate(quiz_data):
        st.write(q["question"])
        if q.get("options"):
            answer = st.radio("Choose one:", q["options"], key=f"q_{idx}")
        else:
            answer = st.text_input("Answer:", key=f"q_{idx}_text")
        responses.append(answer)

    if st.button("Submit Answers"):
        grade_response = requests.post("http://localhost:8000/grade_quiz/", json={
            "questions": quiz_data,
            "responses": responses
        })
        result = grade_response.json()
        st.success(f"You scored {result['score']} out of {result['total']} (Accuracy: {result['accuracy'] * 100}%)")