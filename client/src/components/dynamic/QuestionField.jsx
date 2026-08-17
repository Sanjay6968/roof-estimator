import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

export default function QuestionField({ question, value, onChange }) {
  if (question.active === false) return null;

  if (question.type === 'number') {
    return (
      <div className="flex flex-col gap-2 my-4">
        <Label className="font-semibold text-gray-800 text-base">
          {question.label} {question.unit ? `(${question.unit})` : ''}
        </Label>
        <Input
          type="number"
          min={question.min}
          max={question.max}
          value={value || ''}
          onChange={(e) => onChange(question.key, Number(e.target.value))}
          placeholder={`Enter value between ${question.min} and ${question.max}`}
          required={question.required}
        />
      </div>
    );
  }

  if (question.type === 'select') {
    return (
      <div className="flex flex-col gap-2 my-4">
        <Label className="font-semibold text-gray-800 text-base">{question.label}</Label>
        <RadioGroup
          value={value}
          onValueChange={(val) => onChange(question.key, val)}
          className="grid grid-cols-1 gap-2"
        >
          {question.options.map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 transition">
              <RadioGroupItem value={opt.value} id={`radio-${opt.value}`} />
              <Label htmlFor={`radio-${opt.value}`} className="cursor-pointer w-full text-base">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }

  return null;
}
