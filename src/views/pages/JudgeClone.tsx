import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Send } from "lucide-react";

const SUPPORTED_LANGUAGES = [
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "Go", value: "go" },
];

const JudgeClone: React.FC = () => {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [testCases, setTestCases] = useState<string[]>(["[1,2,3,3]"]);
  const [activeCase, setActiveCase] = useState(0);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState("");

  const runCode = async () => {
    // Mock API call to run code
    setConsoleOutput(
      `Running ${language} code with input: ${testCases[activeCase]}`
    );
    setShowConsole(true);
  };

  const submitCode = async () => {
    // Mock API call to submit code
    setConsoleOutput(`Submitting ${language} solution...`);
    setShowConsole(true);
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Left Panel: Question */}
      {!showConsole && (
        <div className="w-1/2 border-r border-border p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-2">Contains Duplicate</h2>
          <p className="text-sm mb-4">
            Given an integer array <code>nums</code>, return <code>true</code>{" "}
            if any value appears more than once in the array, otherwise return{" "}
            <code>false</code>.
          </p>
          <div className="mb-4">
            <p className="font-semibold">Example 1:</p>
            <pre className="bg-muted p-2 rounded">
              Input: [1,2,3,3]\nOutput: true
            </pre>
          </div>
          <div className="mb-4">
            <p className="font-semibold">Example 2:</p>
            <pre className="bg-muted p-2 rounded">
              Input: [1,2,3,4]\nOutput: false
            </pre>
          </div>
        </div>
      )}

      {/* Right Panel: Code + Testcases */}
      <div className="flex-1 flex flex-col">
        {/* Language + Editor */}
        <div className="flex items-center justify-between border-b border-border p-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button size="sm" onClick={runCode}>
              <Play className="h-4 w-4 mr-1" /> Run
            </Button>
            <Button size="sm" variant="secondary" onClick={submitCode}>
              <Send className="h-4 w-4 mr-1" /> Submit
            </Button>
          </div>
        </div>

        {!showConsole && (
          <>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 font-mono bg-muted/30 border-0 rounded-none focus-visible:ring-0"
              placeholder={`Write your ${language} code here...`}
            />

            {/* Testcases */}
            <div className="border-t border-border p-2">
              <Tabs defaultValue={`case-${activeCase}`}>
                <TabsList>
                  {testCases.map((_, idx) => (
                    <TabsTrigger
                      key={idx}
                      value={`case-${idx}`}
                      onClick={() => setActiveCase(idx)}
                    >
                      Case {idx + 1}
                    </TabsTrigger>
                  ))}
                  <TabsTrigger
                    value="add"
                    onClick={() => setTestCases([...testCases, ""])}
                  >
                    +
                  </TabsTrigger>
                </TabsList>
                {testCases.map((val, idx) => (
                  <TabsContent key={idx} value={`case-${idx}`}>
                    <Textarea
                      value={val}
                      onChange={(e) => {
                        const updated = [...testCases];
                        updated[idx] = e.target.value;
                        setTestCases(updated);
                      }}
                      className="font-mono bg-muted/50 border mt-2 border-border"
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </>
        )}

        {/* Console */}
        {showConsole && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-border p-2">
              <h3 className="font-semibold">Console</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowConsole(false)}
              >
                Back to Editor
              </Button>
            </div>
            <pre className="flex-1 overflow-auto bg-black text-green-400 p-3 text-sm">
              {consoleOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgeClone;
