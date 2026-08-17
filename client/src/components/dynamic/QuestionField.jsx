import React from 'react';

export default function QuestionField({ question, value, onChange }) {
  if (!question.active) return null;

  if (question.type === 'number') {
    return (
      <div className="flex flex-col gap-2 my-4">
        <label className="font-semibold text-gray-800">
          {question.label} {question.unit ? `(${question.unit})` : ''}
        </label>
        <input
          type="number"
          min={question.min}
          max={question.max}
          value={value || ''}
          onChange={(e) => onChange(question.key, Number(e.target.value))}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
          placeholder={`Enter value between ${question.min} and ${question.max}`}
          required={question.required}
        />
      </div>
    );
  }

  if (question.type === 'select') {
    return (
      <div className="flex flex-col gap-2 my-4">
        <label className="font-semibold text-gray-800">{question.label}</label>
        <div className="grid grid-cols-1 gap-2">
          {question.options.map((opt) => (
            <label
              key={opt.value}
              className={`p-3 border rounded-lg cursor-pointer flex items-center justify-between transition ${
                value === opt.value ? 'bg-blue-50 border-blue-600 font-medium' : 'hover:bg-gray-50'
              }`}
            >
              <span>{opt.label}</span>
              <input
                type="radio"
                name={question.key}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(question.key, opt.value)}
                className="h-4 w-4 text-blue-600"
              />
            </label>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
