export default function EvaluationSummary() {
  return (
    <div className="mx-auto w-[95vw] p-4 space-y-6 bg-white">
      {/* Header */}
      <h1 className="text-base font-bold text-gray-800">Evaluation Summary</h1>

      {/* Student Information */}
      <div className="border border-[#e6e3d8] rounded-md">
        <div className="bg-[#faf9f5] px-4 py-2 border-b border-[#e6e3d8] rounded-t-md">
          <h2 className="text-sm font-medium text-gray-700">Student Information</h2>
        </div>
      </div>

      <div className="flex flex-wrap justify-between text-sm px-1 -mt-4">
        <div className="flex gap-2">
          <span className="text-gray-600">Student Name:</span>
          <span>Aarav Sharma</span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-600">Student ID:</span>
          <span>2024-1023-1230</span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-600">Submission Document:</span>
          <span className="text-orange-500">Preview</span>
        </div>
      </div>

      {/* Evaluation Summary */}
      <h2 className="text-base font-bold text-gray-800 mt-8">Evaluation Summary</h2>

      {/* Evaluation Details */}
      <div className="border border-[#e6e3d8] rounded-md">
        <div className="bg-[#faf9f5] px-4 py-2 border-b border-[#e6e3d8] rounded-t-md">
          <h3 className="text-sm font-medium text-gray-700">Evaluation Details</h3>
        </div>
      </div>

      <div className="space-y-4 -mt-4 px-1">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-gray-600">Assessment:</span>
          <span>Assessment Name</span>
        </div>

        <div className="flex flex-wrap gap-2 text-sm items-start">
          <span className="text-gray-600 w-16">Summary:</span>
          <span className="flex-1">
            The student has demonstrated a good understanding of key concepts and processes in Biology. Most answers
            included relevant definitions and basic explanations, but lacked depth in application and examples in a few
            questions. Diagrams were used but inconsistently labeled. There is room for improvement in presentation and
            completeness of answers.
          </span>
        </div>
      </div>

      <div className="absolute right-8 mt-[-100px]">
        <div className="text-xs text-gray-600">Total Marks:</div>
        <div className="text-center font-bold text-orange-500 text-2xl">70/100</div>
      </div>

      {/* Performance Breakdown */}
      <div className="flex justify-between items-center mt-8">
        <h2 className="text-base font-bold text-gray-800">Performance Breakdown</h2>
      </div>

      {/* Question-wise Marking */}
      <div className="border border-[#e6e3d8] rounded-md">
        <div className="bg-[#faf9f5] px-4 py-2 border-b border-[#e6e3d8] rounded-t-md">
          <h3 className="text-sm font-medium text-gray-700">Question-wise Marking</h3>
        </div>
      </div>

      <div className="overflow-x-auto -mt-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#f8f4e8]">
              <th className="p-2 border border-[#e6e3d8] text-left font-medium">Q No.</th>
              <th className="p-2 border border-[#e6e3d8] text-left font-medium">Question</th>
              <th className="p-2 border border-[#e6e3d8] text-left font-medium">Marks</th>
              <th className="p-2 border border-[#e6e3d8] text-left font-medium">Feedback</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-[#faf9f5]">
              <td className="p-2 border border-[#e6e3d8]">01</td>
              <td className="p-2 border border-[#e6e3d8]">
                Which of the following can make a parallel beam of light when light from a point source is incident on
                it?
              </td>
              <td className="p-2 border border-[#e6e3d8]">8/10</td>
              <td className="p-2 border border-[#e6e3d8]">Good intro and explanation.</td>
            </tr>
            <tr>
              <td className="p-2 border border-[#e6e3d8]">02</td>
              <td className="p-2 border border-[#e6e3d8]">
                A 10 mm long nail pin is placed vertically in front of a concave mirror. A 5 mm long image of the nail
                pin is formed at 1.5m in front of the mirror. The focal length of this mirror is...
              </td>
              <td className="p-2 border border-[#e6e3d8]">7/10</td>
              <td className="p-2 border border-[#e6e3d8]">Definition and example present, but lacked detail.</td>
            </tr>
            <tr className="bg-[#faf9f5]">
              <td className="p-2 border border-[#e6e3d8]">03</td>
              <td className="p-2 border border-[#e6e3d8]">
                Under which of the following conditions a concave mirror can form an image larger than the actual
                object?
              </td>
              <td className="p-2 border border-[#e6e3d8]">6/10</td>
              <td className="p-2 border border-[#e6e3d8]">Concept was correct, but explanation was unclear.</td>
            </tr>
            <tr>
              <td className="p-2 border border-[#e6e3d8]">04</td>
              <td className="p-2 border border-[#e6e3d8]">
                Figure shows a ray of light as it travels from medium A to medium. Refractive index of the medium B
                relative to the medium A is...
              </td>
              <td className="p-2 border border-[#e6e3d8]">9/10</td>
              <td className="p-2 border border-[#e6e3d8]">Excellent answer with diagram and clear steps.</td>
            </tr>
            <tr className="bg-[#faf9f5]">
              <td className="p-2 border border-[#e6e3d8]">05</td>
              <td className="p-2 border border-[#e6e3d8]">
                A light ray enters from medium A to medium B as shown in Figure. The refractive index of medium B
                relative to A will be...
              </td>
              <td className="p-2 border border-[#e6e3d8]">4/10</td>
              <td className="p-2 border border-[#e6e3d8]">Well-structured, but missing diagram labeling.</td>
            </tr>
            <tr>
              <td className="p-2 border border-[#e6e3d8]">06</td>
              <td className="p-2 border border-[#e6e3d8]">
                Beams of light are incident through the holes A and B and emerge out of box through the holes C and D
                respectively as shown in the Figure. Which of the following could be inside the box?
              </td>
              <td className="p-2 border border-[#e6e3d8]">6/10</td>
              <td className="p-2 border border-[#e6e3d8]">Incomplete answer. No example or conclusion.</td>
            </tr>
            <tr className="bg-[#faf9f5]">
              <td className="p-2 border border-[#e6e3d8]">07</td>
              <td className="p-2 border border-[#e6e3d8]">
                A beam of light is incident through the holes on sides A and emerges out of the holes on the other face
                of the box as shown in the Figure. Which of the following could be inside the box?
              </td>
              <td className="p-2 border border-[#e6e3d8]">8/10</td>
              <td className="p-2 border border-[#e6e3d8]">Concept was correct, but explanation was unclear.</td>
            </tr>
            <tr>
              <td className="p-2 border border-[#e6e3d8]">08</td>
              <td className="p-2 border border-[#e6e3d8]">Which of the following statements is true?</td>
              <td className="p-2 border border-[#e6e3d8]">5/10</td>
              <td className="p-2 border border-[#e6e3d8]">Off-topic points reduced clarity.</td>
            </tr>
            <tr className="bg-[#faf9f5]">
              <td className="p-2 border border-[#e6e3d8]">09</td>
              <td className="p-2 border border-[#e6e3d8]">
                Magnification produced by a rear-view mirror fitted in vehicles?
              </td>
              <td className="p-2 border border-[#e6e3d8]">9/10</td>
              <td className="p-2 border border-[#e6e3d8]">Concept was correct, but explanation was unclear.</td>
            </tr>
            <tr>
              <td className="p-2 border border-[#e6e3d8]">10</td>
              <td className="p-2 border border-[#e6e3d8]">
                Rays from Sun converge at a point 15 cm in front of a concave mirror. Where should an object be placed
                so that size of its image is equal to the size of the object?
              </td>
              <td className="p-2 border border-[#e6e3d8]">8/10</td>
              <td className="p-2 border border-[#e6e3d8]">Good explanation, minor grammar issues.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
