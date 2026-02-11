"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Calendar,
  MessageSquare,
  Wand2,
  Scissors,
  Sparkles,
  Heart,
  Check,
  GripVertical,
  Pencil,
  RotateCcw,
  X,
} from "lucide-react";

// Try to import Convex - will be undefined in mock mode
let useQuery: any, useMutation: any, api: any;
try {
  const convexReact = require("convex/react");
  useQuery = convexReact.useQuery;
  useMutation = convexReact.useMutation;
  api = require("@my-better-t-app/backend/convex/_generated/api").api;
} catch {
  // Mock mode
}

interface DateSelection {
  year?: number;
  month?: number;
  day?: number;
}

interface ImageData {
  id: string;
  preview: string;
  note: string;
  date: string; // formatted string for display/storage
  dateSelection?: DateSelection; // structured date
  enhancedNote?: string;
  isEnhancing?: boolean;
  isRemovingBg?: boolean;
  bgRemoved?: boolean;
  originalPreview?: string;
  stickerUrl?: string; // Background-removed version for premium animations
  isEditingEnhanced?: boolean;
  editedEnhancedNote?: string;
}

// Generate years from current year back to 1950
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= 1950; y--) {
    years.push(y);
  }
  return years;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Get days in a month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

interface MetadataStepProps {
  projectId: any;
  onComplete: () => void;
  onBack: () => void;
}

// Background removal API URL (configurable)
const BG_REMOVER_URL = process.env.NEXT_PUBLIC_BG_REMOVER_URL || "http://localhost:8001";

// Common misspellings and corrections
const COMMON_CORRECTIONS: Record<string, string> = {
  // Common typos
  "teh": "the", "thier": "their", "wierd": "weird", "freind": "friend",
  "recieve": "receive", "beleive": "believe", "occured": "occurred",
  "untill": "until", "tommorow": "tomorrow", "definately": "definitely",
  "seperate": "separate", "occassion": "occasion", "accomodate": "accommodate",
  "begining": "beginning", "comming": "coming", "beautifull": "beautiful",
  "wonderfull": "wonderful", "realy": "really", "finaly": "finally",
  "basicly": "basically", "actualy": "actually", "usualy": "usually",
  "probaly": "probably", "goverment": "government", "enviroment": "environment",
  "remeber": "remember", "togather": "together", "toghether": "together",
  "becuase": "because", "beacuse": "because", "alot": "a lot",
  "doesnt": "doesn't", "dont": "don't", "wont": "won't", "cant": "can't",
  "didnt": "didn't", "wouldnt": "wouldn't", "couldnt": "couldn't",
  "shouldnt": "shouldn't", "isnt": "isn't", "wasnt": "wasn't",
  "werent": "weren't", "havent": "haven't", "hasnt": "hasn't",
  "im": "I'm", "ive": "I've", "id": "I'd", "ill": "I'll",
  "youre": "you're", "youve": "you've", "youd": "you'd",
  "hes": "he's", "shes": "she's", "theyre": "they're",
  "weve": "we've", "wed": "we'd", "were": "we're",
  "thats": "that's", "whats": "what's", "heres": "here's",
  "lets": "let's", "its": "it's", "whos": "who's",
  // Romance/relationship words
  "anniversery": "anniversary", "valentines": "Valentine's",
  "engagment": "engagement", "marraige": "marriage", "mariage": "marriage",
  "realtionship": "relationship", "relatioship": "relationship",
  "boyfreind": "boyfriend", "girlfreind": "girlfriend",
  "resturant": "restaurant", "restraunt": "restaurant",
  "dinning": "dining", "diner": "dinner",
  // Time/event words
  "febuary": "February", "wensday": "Wednesday", "wendsday": "Wednesday",
  "saturday": "Saturday", "sunday": "Sunday",
  "holliday": "holiday", "vacaton": "vacation", "vaccation": "vacation",
  "collage": "college", "univeristy": "university",
  "conferance": "conference", "confrence": "conference",
  "seniour": "senior", "juinor": "junior",
  // Common words
  "happend": "happened", "happenned": "happened",
  "started": "started", "strated": "started",
  "walked": "walked", "walkd": "walked",
  "talked": "talked", "talkd": "talked",
  "laught": "laughed", "laughd": "laughed",
  "loveed": "loved", "lovd": "loved",
};

// Correct spelling and grammar in text
const correctSpellingAndGrammar = (text: string): string => {
  let corrected = text;

  // Apply word-level corrections
  Object.entries(COMMON_CORRECTIONS).forEach(([wrong, right]) => {
    // Match whole words only, case-insensitive
    const regex = new RegExp(`\\b${wrong}\\b`, "gi");
    corrected = corrected.replace(regex, (match) => {
      // Preserve original case pattern
      if (match === match.toUpperCase()) return right.toUpperCase();
      if (match[0] === match[0].toUpperCase()) {
        return right.charAt(0).toUpperCase() + right.slice(1);
      }
      return right;
    });
  });

  // Fix double spaces
  corrected = corrected.replace(/\s+/g, " ");

  // Capitalize first letter of sentences
  corrected = corrected.replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => {
    return p1 + p2.toUpperCase();
  });

  // Capitalize "I" when standalone
  corrected = corrected.replace(/\bi\b/g, "I");

  // Fix common punctuation issues
  corrected = corrected.replace(/\s+([.,!?])/g, "$1"); // Remove space before punctuation
  corrected = corrected.replace(/([.,!?])([A-Za-z])/g, "$1 $2"); // Add space after punctuation

  return corrected.trim();
};

// Parse couple names from "Emma & James" format
const parseNames = (coupleName: string): { name1: string; name2: string } => {
  const separators = [" & ", " and ", " + ", " with ", ", "];
  for (const sep of separators) {
    if (coupleName.toLowerCase().includes(sep.toLowerCase())) {
      const parts = coupleName.split(new RegExp(sep, "i"));
      if (parts.length >= 2) {
        return { name1: parts[0].trim(), name2: parts[1].trim() };
      }
    }
  }
  return { name1: "She", name2: "He" };
};

// Format date for display - handles all combinations
const formatDateForNarrative = (date: { year?: number; month?: number; day?: number }): string => {
  if (!date) return "";

  const months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];

  const { day, month, year } = date;

  // All three: March 15, 2023
  if (day && month && year) {
    return `${months[month - 1]} ${day}, ${year}`;
  }
  // Month and year: March 2023
  if (month && year) {
    return `${months[month - 1]} ${year}`;
  }
  // Day and month: March 15
  if (day && month) {
    return `${months[month - 1]} ${day}`;
  }
  // Only year: 2023
  if (year) {
    return `${year}`;
  }
  // Only month: March
  if (month) {
    return `${months[month - 1]}`;
  }
  // Only day: the 15th
  if (day) {
    const suffix = day === 1 || day === 21 || day === 31 ? "st" :
                   day === 2 || day === 22 ? "nd" :
                   day === 3 || day === 23 ? "rd" : "th";
    return `the ${day}${suffix}`;
  }
  return "";
};

// Smart AI enhancement - THIRD PERSON NARRATIVE STYLE
// Builds on the user's actual story, doesn't replace it
const generateContextualEnhancement = (
  currentNote: string,
  currentDate: string,
  imageIndex: number,
  totalImages: number,
  previousEnhancements: string[],
  coupleName: string
): string => {
  // First, correct any spelling/grammar issues in the note
  const correctedNote = correctSpellingAndGrammar(currentNote);

  const { name1, name2 } = parseNames(coupleName);
  const isFirst = imageIndex === 0;
  const isLast = imageIndex === totalImages - 1;

  // Convert user's note to third person narrative
  const convertToThirdPerson = (note: string): string => {
    let converted = note;

    // Replace first person with names (she/he)
    // "I was" -> "She was" / "name1 was"
    converted = converted.replace(/\bI was\b/gi, `${name1} was`);
    converted = converted.replace(/\bI am\b/gi, `${name1} is`);
    converted = converted.replace(/\bI'm\b/gi, `${name1} is`);
    converted = converted.replace(/\bI\b/g, name1);

    // "my" -> "her"
    converted = converted.replace(/\bmy\b/gi, "her");
    converted = converted.replace(/\bMy\b/g, "Her");

    // "me" -> "her"
    converted = converted.replace(/\bme\b/gi, "her");

    // "we" -> "they" or use names
    converted = converted.replace(/\bwe were\b/gi, `${name1} and ${name2} were`);
    converted = converted.replace(/\bwe are\b/gi, `${name1} and ${name2} are`);
    converted = converted.replace(/\bwe're\b/gi, `${name1} and ${name2} are`);
    converted = converted.replace(/\bwe\b/gi, "they");

    // "our" -> "their"
    converted = converted.replace(/\bour\b/gi, "their");

    // "us" -> "them"
    converted = converted.replace(/\bus\b/gi, "them");

    // Handle "he/she was" mentions - try to use name2
    converted = converted.replace(/\bhe was\b/gi, `${name2} was`);
    converted = converted.replace(/\bshe was\b/gi, `${name1} was`);
    converted = converted.replace(/\bhe is\b/gi, `${name2} is`);
    converted = converted.replace(/\bshe is\b/gi, `${name1} is`);

    // "his" when referring to the partner
    converted = converted.replace(/\bhis\b/gi, `${name2}'s`);

    return converted;
  };

  // Convert the user's note to third person
  const thirdPersonNote = convertToThirdPerson(correctedNote);

  // Opening based on position in the story
  let opening = "";
  if (isFirst) {
    const firstOpenings = [
      "This is where it all began.",
      "Their story started here.",
      "The beginning of something beautiful.",
    ];
    opening = firstOpenings[Math.floor(Math.random() * firstOpenings.length)];
  } else if (isLast) {
    const lastOpenings = [
      "And here they are now.",
      "Looking back at how far they've come.",
      "Their journey continues.",
    ];
    opening = lastOpenings[Math.floor(Math.random() * lastOpenings.length)];
  } else {
    const middleOpenings = [
      "As time went on,",
      "Their story continued.",
      "Another chapter unfolded.",
      "",  // Sometimes no opening needed
    ];
    opening = middleOpenings[Math.floor(Math.random() * middleOpenings.length)];
  }

  // Add date context naturally
  let datePhrase = "";
  if (currentDate) {
    const dateIntros = [
      `It was ${currentDate}.`,
      `Back in ${currentDate},`,
      `${currentDate} —`,
    ];
    datePhrase = dateIntros[Math.floor(Math.random() * dateIntros.length)];
  }

  // Add a warm closing based on the mood/content
  const noteLower = correctedNote.toLowerCase();
  let closing = "";

  if (noteLower.includes("first") || noteLower.includes("met") || noteLower.includes("began")) {
    const firstClosings = [
      "Little did they know, this was just the beginning.",
      "And from that moment, everything changed.",
      "A moment that would shape their forever.",
    ];
    closing = firstClosings[Math.floor(Math.random() * firstClosings.length)];
  } else if (noteLower.includes("love") || noteLower.includes("heart")) {
    const loveClosings = [
      "Their hearts knew they were meant to be.",
      "Love was writing their story.",
      "",
    ];
    closing = loveClosings[Math.floor(Math.random() * loveClosings.length)];
  } else if (noteLower.includes("happy") || noteLower.includes("laugh") || noteLower.includes("fun")) {
    const happyClosings = [
      "Moments like these made it all worthwhile.",
      "Pure joy, captured forever.",
      "",
    ];
    closing = happyClosings[Math.floor(Math.random() * happyClosings.length)];
  }

  // Build the final narrative - keeping user's story as the core
  const parts = [opening, datePhrase, thirdPersonNote, closing].filter(p => p.trim());
  return parts.join(" ").replace(/\s+/g, " ").trim();
};

export function MetadataStep({
  projectId,
  onComplete,
  onBack,
}: MetadataStepProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [coupleName, setCoupleName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEnhancingAll, setIsEnhancingAll] = useState(false);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  // Try to use Convex queries/mutations
  let project: any = null;
  let updateImage: any, updateProject: any;
  try {
    project = useQuery?.(api?.videos?.getProject, { projectId });
    updateImage = useMutation?.(api?.videos?.updateImage);
    updateProject = useMutation?.(api?.videos?.updateProject);
  } catch {
    // Mock mode
  }

  // Initialize with actual uploaded images or from Convex
  useEffect(() => {
    if (project?.images) {
      setImages(
        project.images.map((img: any) => ({
          id: img._id,
          preview: img.url || "",
          note: img.originalNote || "",
          date: img.imageDate || "",
          enhancedNote: img.enhancedCaption || "",
        }))
      );
    } else if (images.length === 0) {
      const stored = sessionStorage.getItem("uploadedImages");
      if (stored) {
        try {
          const parsedImages = JSON.parse(stored);
          setImages(parsedImages);
        } catch {
          console.error("Failed to parse stored images");
        }
      }
    }

    // Load couple name and start date from sessionStorage
    const storedCoupleName = sessionStorage.getItem("coupleName");
    const storedStartDate = sessionStorage.getItem("startDate");
    if (storedCoupleName) setCoupleName(storedCoupleName);
    if (storedStartDate) setStartDate(storedStartDate);
  }, [project]);

  const updateImageData = (id: string, updates: Partial<ImageData>) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragCounter.current++;
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);

    if (dragIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setImages((prev) => {
      const newImages = [...prev];
      const [draggedItem] = newImages.splice(dragIndex, 1);
      newImages.splice(dropIndex, 0, draggedItem);
      return newImages;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  // AI Enhance single note with context
  const enhanceNote = async (id: string) => {
    const imageIndex = images.findIndex((img) => img.id === id);
    const image = images[imageIndex];
    if (!image || !image.note.trim()) return;

    updateImageData(id, { isEnhancing: true });

    try {
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 1200));

      // Get previous enhancements for context (to avoid repetition)
      const previousEnhancements = images
        .slice(0, imageIndex)
        .map((img) => img.enhancedNote || "")
        .filter(Boolean);

      // Generate contextual enhancement
      const enhanced = generateContextualEnhancement(
        image.note,
        image.date,
        imageIndex,
        images.length,
        previousEnhancements,
        coupleName
      );

      updateImageData(id, {
        enhancedNote: enhanced,
        isEnhancing: false,
        isEditingEnhanced: false,
      });
    } catch (error) {
      console.error("Enhancement failed:", error);
      updateImageData(id, { isEnhancing: false });
    }
  };

  // AI Enhance all notes sequentially (to build context)
  const enhanceAllNotes = async () => {
    const imagesToEnhance = images.filter((img) => img.note.trim());
    if (imagesToEnhance.length === 0) return;

    setIsEnhancingAll(true);

    // Process sequentially to maintain context
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (image.note.trim() && !image.enhancedNote) {
        await enhanceNote(image.id);
        // Small delay between each for better UX
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    setIsEnhancingAll(false);
  };

  // Start editing enhanced note
  const startEditingEnhanced = (id: string) => {
    const image = images.find((img) => img.id === id);
    if (!image?.enhancedNote) return;
    updateImageData(id, {
      isEditingEnhanced: true,
      editedEnhancedNote: image.enhancedNote,
    });
  };

  // Save edited enhanced note
  const saveEditedEnhanced = (id: string) => {
    const image = images.find((img) => img.id === id);
    if (!image) return;
    updateImageData(id, {
      enhancedNote: image.editedEnhancedNote || image.enhancedNote,
      isEditingEnhanced: false,
      editedEnhancedNote: undefined,
    });
  };

  // Cancel editing
  const cancelEditingEnhanced = (id: string) => {
    updateImageData(id, {
      isEditingEnhanced: false,
      editedEnhancedNote: undefined,
    });
  };

  // Regenerate enhanced note
  const regenerateEnhanced = async (id: string) => {
    updateImageData(id, { enhancedNote: undefined });
    await enhanceNote(id);
  };

  // Remove background from image
  const removeBackground = async (id: string) => {
    const image = images.find((img) => img.id === id);
    if (!image) return;

    updateImageData(id, { isRemovingBg: true });

    try {
      const response = await fetch(image.preview);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob, "image.jpg");

      const bgResponse = await fetch(`${BG_REMOVER_URL}/remove-background-base64`, {
        method: "POST",
        body: formData,
      });

      if (!bgResponse.ok) {
        throw new Error("Background removal failed");
      }

      const result = await bgResponse.json();

      // Keep base64 data URL for sticker images - blob URLs don't persist across sessions
      // and the renderer needs a valid URL to load the image
      // Store stickerUrl separately for premium animations
      updateImageData(id, {
        originalPreview: image.originalPreview || image.preview,
        preview: image.originalPreview || image.preview, // Keep original as main preview
        stickerUrl: result.data_url, // Store background-removed as sticker
        isRemovingBg: false,
        bgRemoved: true,
      });
    } catch (error) {
      console.error("Background removal failed:", error);
      updateImageData(id, { isRemovingBg: false });
    }
  };

  const restoreOriginal = (id: string) => {
    const image = images.find((img) => img.id === id);
    if (!image?.originalPreview) return;
    updateImageData(id, {
      preview: image.originalPreview,
      stickerUrl: undefined,
      bgRemoved: false,
    });
  };

  const handleContinue = async () => {
    // Validate required fields
    if (!startDate) {
      alert("Please enter when you met before continuing");
      return;
    }

    setIsSaving(true);

    try {
      if (updateProject && coupleName.trim()) {
        await updateProject({ projectId, coupleName: coupleName.trim() });
      }

      if (updateImage) {
        for (const image of images) {
          await updateImage({
            imageId: image.id,
            originalNote: image.note,
            imageDate: image.date || undefined,
          });
        }
      }

      sessionStorage.setItem("uploadedImages", JSON.stringify(images));
      sessionStorage.setItem("coupleName", coupleName.trim() || "Our Love Story");
      if (startDate) {
        sessionStorage.setItem("startDate", startDate);
      }
      await new Promise((r) => setTimeout(r, 500));
      onComplete();
    } catch (error) {
      console.error("Failed to save:", error);
      setIsSaving(false);
    }
  };

  const allImagesHaveNotes = images.every((img) => img.note.trim().length > 0);
  const notesWithContent = images.filter((img) => img.note.trim()).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Tell Your Story</h2>
        <p className="text-gray-500">
          Add a note about each memory. AI will create unique, connected captions that tell your love story.
        </p>
      </div>

      {/* Couple Name */}
      <div className="mb-8 p-5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-100">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
          <label className="text-sm font-semibold text-gray-700">Your Names</label>
          <span className="text-xs text-gray-400">(appears on final slide)</span>
        </div>
        <Input
          placeholder="e.g., Emma & James"
          value={coupleName}
          onChange={(e) => setCoupleName(e.target.value)}
          className="max-w-sm bg-white border-pink-200 focus:border-pink-400 focus:ring-pink-400"
        />
      </div>

      {/* Start Date */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-pink-500" />
          <label className="text-sm font-semibold text-gray-700">When Did You Meet?</label>
          <span className="text-xs text-red-500">*Required</span>
        </div>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="max-w-sm bg-white border-pink-200 focus:border-pink-400 focus:ring-pink-400"
          required
        />
        {startDate && (
          <p className="text-xs text-gray-500 mt-1">
            {(() => {
              const start = new Date(startDate);
              const today = new Date();
              const days = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
              return `${days} ${days === 1 ? "day" : "days"} together`;
            })()}
          </p>
        )}
      </div>

      {/* Enhance All Button */}
      {notesWithContent > 0 && (
        <div className="mb-6 flex justify-end">
          <Button
            onClick={enhanceAllNotes}
            disabled={isEnhancingAll}
            variant="outline"
            className="border-pink-300 text-pink-600 hover:bg-pink-50"
          >
            {isEnhancingAll ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating your story...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                AI Enhance All Notes
                <Sparkles className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Drag hint */}
      {images.length > 1 && (
        <div className="mb-4 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          <GripVertical className="h-4 w-4" />
          <span>Drag cards to reorder photos in your video</span>
        </div>
      )}

      {/* Image Cards */}
      <div className="space-y-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable={!isSaving && !image.isEditingEnhanced}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`
              flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-2xl border transition-all duration-200
              ${!isSaving && !image.isEditingEnhanced ? "cursor-grab active:cursor-grabbing" : ""}
              ${draggedIndex === index ? "opacity-50 scale-[0.98] border-gray-200" : "border-gray-100 shadow-sm hover:shadow-md"}
              ${dragOverIndex === index && draggedIndex !== index ? "ring-4 ring-pink-400 ring-offset-2 scale-[1.01] border-pink-300" : ""}
            `}
          >
            {/* Drag handle */}
            <div className="hidden sm:flex items-center pr-2 text-gray-300 hover:text-gray-500 cursor-grab">
              <GripVertical className="h-6 w-6" />
            </div>

            {/* Image with controls */}
            <div className="flex-shrink-0">
              <div className="relative w-full sm:w-36 h-36 rounded-xl overflow-hidden bg-gray-100 group">
                <img
                  src={image.preview}
                  alt={`Photo ${index + 1}`}
                  className={`w-full h-full object-cover transition-transform group-hover:scale-105 pointer-events-none ${
                    image.bgRemoved ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImNoZWNrZXIiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjY2hlY2tlcikiLz48L3N2Zz4=')]" : ""
                  }`}
                  draggable={false}
                />
                <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-xs font-bold flex items-center justify-center text-white shadow-lg">
                  {index + 1}
                </div>
                {image.bgRemoved && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-green-500 text-white text-xs font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Sticker
                  </div>
                )}
                {image.isRemovingBg && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <span className="text-xs">Removing BG...</span>
                  </div>
                )}
              </div>

              <div className="mt-3">
                {image.bgRemoved ? (
                  <Button
                    onClick={() => restoreOriginal(image.id)}
                    size="sm"
                    variant="outline"
                    className="w-full text-xs border-gray-300 text-gray-600"
                  >
                    Restore Original
                  </Button>
                ) : (
                  <Button
                    onClick={() => removeBackground(image.id)}
                    disabled={image.isRemovingBg}
                    size="sm"
                    variant="outline"
                    className="w-full text-xs border-pink-300 text-pink-600 hover:bg-pink-50"
                  >
                    <Scissors className="h-3 w-3 mr-1.5" />
                    Remove Background
                  </Button>
                )}
              </div>
            </div>

            {/* Text inputs */}
            <div className="flex-1 space-y-4">
              {/* Note input */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-2">
                  <MessageSquare className="h-4 w-4 text-pink-500" />
                  What&apos;s the story?
                </label>
                <div className="relative">
                  <Textarea
                    placeholder="e.g., Our first date at the coffee shop downtown..."
                    value={image.note}
                    onChange={(e) => updateImageData(image.id, { note: e.target.value })}
                    className="min-h-[80px] resize-none border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                    rows={2}
                  />
                  {image.note.trim() && !image.enhancedNote && (
                    <Button
                      onClick={() => enhanceNote(image.id)}
                      disabled={image.isEnhancing}
                      size="sm"
                      className="absolute bottom-2 right-2 h-7 px-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs"
                    >
                      {image.isEnhancing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Wand2 className="h-3 w-3 mr-1" />
                          AI Enhance
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Enhanced note preview/edit */}
              {image.enhancedNote && (
                <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs text-pink-600 font-medium">
                      <Sparkles className="h-3 w-3" />
                      AI Enhanced Caption
                    </div>
                    {!image.isEditingEnhanced && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditingEnhanced(image.id)}
                          className="p-1.5 rounded-lg hover:bg-pink-100 text-pink-500 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => regenerateEnhanced(image.id)}
                          disabled={image.isEnhancing}
                          className="p-1.5 rounded-lg hover:bg-pink-100 text-pink-500 transition-colors disabled:opacity-50"
                          title="Regenerate"
                        >
                          {image.isEnhancing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {image.isEditingEnhanced ? (
                    <div className="space-y-2">
                      <Textarea
                        value={image.editedEnhancedNote || ""}
                        onChange={(e) => updateImageData(image.id, { editedEnhancedNote: e.target.value })}
                        className="min-h-[80px] resize-none bg-white border-pink-200 focus:border-pink-400 focus:ring-pink-400 text-sm"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => cancelEditingEnhanced(image.id)}
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-gray-500"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          onClick={() => saveEditedEnhanced(image.id)}
                          size="sm"
                          className="h-7 px-3 text-xs bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">&ldquo;{image.enhancedNote}&rdquo;</p>
                  )}
                </div>
              )}

              {/* Flexible Date Picker - All fields visible */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-2">
                  <Calendar className="h-4 w-4 text-pink-500" />
                  When was this?
                  <span className="text-xs text-gray-400 font-normal">(fill in what you remember)</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Day selector */}
                  <select
                    value={image.dateSelection?.day || ""}
                    onChange={(e) => {
                      const day = e.target.value ? parseInt(e.target.value) : undefined;
                      const newDateSelection = { ...image.dateSelection, day };
                      if (!day) delete newDateSelection.day;
                      const dateStr = formatDateForNarrative(newDateSelection);
                      updateImageData(image.id, { dateSelection: newDateSelection, date: dateStr });
                    }}
                    className="w-20 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-pink-400 focus:ring-pink-400 focus:outline-none"
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  {/* Month selector */}
                  <select
                    value={image.dateSelection?.month || ""}
                    onChange={(e) => {
                      const month = e.target.value ? parseInt(e.target.value) : undefined;
                      const newDateSelection = { ...image.dateSelection, month };
                      if (!month) delete newDateSelection.month;
                      const dateStr = formatDateForNarrative(newDateSelection);
                      updateImageData(image.id, { dateSelection: newDateSelection, date: dateStr });
                    }}
                    className="w-32 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-pink-400 focus:ring-pink-400 focus:outline-none"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>

                  {/* Year selector */}
                  <select
                    value={image.dateSelection?.year || ""}
                    onChange={(e) => {
                      const year = e.target.value ? parseInt(e.target.value) : undefined;
                      const newDateSelection = { ...image.dateSelection, year };
                      if (!year) delete newDateSelection.year;
                      const dateStr = formatDateForNarrative(newDateSelection);
                      updateImageData(image.id, { dateSelection: newDateSelection, date: dateStr });
                    }}
                    className="w-24 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-pink-400 focus:ring-pink-400 focus:outline-none"
                  >
                    <option value="">Year</option>
                    {generateYears().map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>

                  {/* Clear date button */}
                  {(image.dateSelection?.year || image.dateSelection?.month || image.dateSelection?.day) && (
                    <button
                      onClick={() => updateImageData(image.id, { dateSelection: undefined, date: "" })}
                      className="px-2 py-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Clear date"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {/* Show selected date */}
                {image.date && (
                  <p className="mt-2 text-xs text-pink-600 font-medium">{image.date}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress hint */}
      <div className="mt-6 text-center">
        <span className={`text-sm ${allImagesHaveNotes ? "text-green-600" : "text-gray-400"}`}>
          {notesWithContent}/{images.length} photos have notes
          {!allImagesHaveNotes && " — add notes to all photos to continue"}
        </span>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSaving}
          className="border-gray-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!allImagesHaveNotes || isSaving}
          size="lg"
          className="px-8 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-300/30 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
