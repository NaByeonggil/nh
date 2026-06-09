"use client"

import { LectureForm, type LectureFormValues } from "../LectureForm"

const EMPTY: LectureFormValues = {
  title: "",
  date: "",
  sequence: "",
  status: "DRAFT",
  summary: "",
  body: "",
  topics: "",
  tags: "",
  keyPoints: "",
  questions: "",
}

export default function NewLecturePage() {
  return <LectureForm mode="create" initial={EMPTY} />
}
